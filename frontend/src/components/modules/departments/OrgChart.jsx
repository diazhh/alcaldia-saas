'use client';

import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Building2, Users, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Componente de organigrama visual con zoom y pan
 */
export default function OrgChart({ departments, onNodeClick, className }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [orientation, setOrientation] = useState('vertical'); // 'vertical' | 'horizontal'
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Configuración del layout
  const nodeWidth = 200;
  const nodeHeight = 80;
  const horizontalGap = 50;
  const verticalGap = 80;

  // Calcular posiciones de los nodos
  const calculateNodePositions = (nodes, parentX = 0, parentY = 0, level = 0) => {
    if (!nodes || nodes.length === 0) return [];

    let positions = [];
    let currentX = parentX;

    nodes.forEach((node, index) => {
      const nodePos = {
        ...node,
        x: orientation === 'vertical' ? currentX : parentY,
        y: orientation === 'vertical' ? level * (nodeHeight + verticalGap) : currentX,
        level,
      };

      positions.push(nodePos);

      // Calcular posiciones de los hijos
      if (node.children && node.children.length > 0) {
        const childPositions = calculateNodePositions(
          node.children,
          currentX,
          orientation === 'vertical' ? nodePos.y + nodeHeight + verticalGap : nodePos.x + nodeWidth + horizontalGap,
          level + 1
        );
        positions = positions.concat(childPositions);

        // Ajustar posición del padre para centrarlo sobre los hijos
        if (orientation === 'vertical') {
          const firstChild = childPositions[0];
          const lastChild = childPositions.filter(c => c.level === level + 1).pop();
          if (firstChild && lastChild) {
            const childrenCenter = (firstChild.x + lastChild.x) / 2;
            nodePos.x = childrenCenter;
          }
        }

        // Mover currentX para el siguiente hermano
        const childrenWidth = node.children.length * (nodeWidth + horizontalGap);
        currentX += childrenWidth;
      } else {
        currentX += nodeWidth + horizontalGap;
      }
    });

    return positions;
  };

  const nodePositions = calculateNodePositions(departments);

  // Calcular dimensiones del SVG
  const svgWidth = Math.max(
    ...nodePositions.map(n => n.x + nodeWidth),
    1000
  );
  const svgHeight = Math.max(
    ...nodePositions.map(n => n.y + nodeHeight),
    600
  );

  // Handlers de zoom y pan
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'organigrama.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTypeColor = (type) => {
    const colors = {
      DIRECCION: '#3b82f6',
      COORDINACION: '#10b981',
      DEPARTAMENTO: '#8b5cf6',
      UNIDAD: '#f59e0b',
      SECCION: '#ec4899',
      OFICINA: '#6b7280',
    };
    return colors[type] || '#6b7280';
  };

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No hay departamentos para mostrar en el organigrama</p>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full bg-gray-50 rounded-lg overflow-hidden', className)}>
      {/* Controles */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-md p-2">
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetView}>
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300" />
        <Button variant="outline" size="sm" onClick={() => setOrientation(o => o === 'vertical' ? 'horizontal' : 'vertical')}>
          {orientation === 'vertical' ? '↕️' : '↔️'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportSVG}>
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicador de zoom */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-md px-3 py-1 text-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {/* Definir marcadores para las flechas */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Dibujar conexiones */}
          {nodePositions.map((node) => {
            if (!node.children || node.children.length === 0) return null;

            return node.children.map((child) => {
              const childPos = nodePositions.find(n => n.id === child.id);
              if (!childPos) return null;

              const startX = node.x + nodeWidth / 2;
              const startY = node.y + nodeHeight;
              const endX = childPos.x + nodeWidth / 2;
              const endY = childPos.y;

              return (
                <g key={`${node.id}-${child.id}`}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={startX}
                    y2={startY + verticalGap / 2}
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                  <line
                    x1={startX}
                    y1={startY + verticalGap / 2}
                    x2={endX}
                    y2={startY + verticalGap / 2}
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                  <line
                    x1={endX}
                    y1={startY + verticalGap / 2}
                    x2={endX}
                    y2={endY}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            });
          })}

          {/* Dibujar nodos */}
          {nodePositions.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => onNodeClick && onNodeClick(node)}
              className="cursor-pointer"
            >
              {/* Rectángulo del nodo */}
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx="8"
                fill="white"
                stroke={getTypeColor(node.type)}
                strokeWidth="2"
                className="hover:shadow-lg transition-shadow"
              />

              {/* Barra de color superior */}
              <rect
                width={nodeWidth}
                height="8"
                rx="8"
                fill={getTypeColor(node.type)}
              />

              {/* Icono */}
              <foreignObject x="10" y="18" width="24" height="24">
                <Building2 className="h-5 w-5" style={{ color: getTypeColor(node.type) }} />
              </foreignObject>

              {/* Nombre del departamento */}
              <text
                x={nodeWidth / 2}
                y="35"
                textAnchor="middle"
                className="font-semibold text-sm"
                fill="#1f2937"
              >
                {node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name}
              </text>

              {/* Código */}
              <text
                x={nodeWidth / 2}
                y="52"
                textAnchor="middle"
                className="text-xs"
                fill="#6b7280"
              >
                {node.code}
              </text>

              {/* Contador de empleados */}
              {node._count?.users > 0 && (
                <g transform={`translate(${nodeWidth - 50}, 60)`}>
                  <foreignObject width="40" height="16">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>{node._count.users}</span>
                    </div>
                  </foreignObject>
                </g>
              )}

              {/* Badge de tipo */}
              <foreignObject x="10" y="60" width="80" height="16">
                <div className="text-xs px-2 py-0.5 rounded" style={{
                  backgroundColor: getTypeColor(node.type) + '20',
                  color: getTypeColor(node.type),
                  fontSize: '10px',
                }}>
                  {node.type}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

OrgChart.propTypes = {
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      children: PropTypes.array,
      _count: PropTypes.shape({
        users: PropTypes.number,
      }),
    })
  ).isRequired,
  onNodeClick: PropTypes.func,
  className: PropTypes.string,
};
