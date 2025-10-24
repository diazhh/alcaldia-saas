'use client';

import { useDocumentsByProject } from '@/hooks/useDocuments';
import { formatDate } from '@/lib/utils';

const typeLabels = {
  PLANO: 'Plano',
  DISENO: 'Diseño',
  ESTUDIO: 'Estudio',
  ESPECIFICACION: 'Especificación',
  PRESUPUESTO: 'Presupuesto',
  CRONOGRAMA: 'Cronograma',
  OTRO: 'Otro',
};

const typeIcons = {
  PLANO: '📐',
  DISENO: '🎨',
  ESTUDIO: '📊',
  ESPECIFICACION: '📋',
  PRESUPUESTO: '💰',
  CRONOGRAMA: '📅',
  OTRO: '📄',
};

export default function DocumentList({ projectId }) {
  const { data: documents, isLoading, error } = useDocumentsByProject(projectId);

  if (isLoading) {
    return <div className="text-center py-4">Cargando documentos...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error al cargar documentos: {error.message}</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay documentos técnicos registrados para este proyecto.
      </div>
    );
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">{typeIcons[doc.type]}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{doc.name}</h3>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">
                {typeLabels[doc.type]}
              </span>
            </div>
          </div>

          {doc.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
          )}

          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Versión:</span>
              <span className="font-medium text-gray-700">{doc.version}</span>
            </div>
            <div className="flex justify-between">
              <span>Tamaño:</span>
              <span className="font-medium text-gray-700">{formatFileSize(doc.fileSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subido por:</span>
              <span className="font-medium text-gray-700">
                {doc.uploader?.firstName} {doc.uploader?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span className="font-medium text-gray-700">{formatDate(doc.createdAt)}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex gap-2">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Descargar
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
