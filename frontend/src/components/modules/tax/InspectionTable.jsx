'use client';

import { useState, useEffect } from 'react';
import { Eye, Plus, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';

const INSPECTION_TYPES = {
  ROUTINE: 'Rutinaria',
  COMPLAINT: 'Por Denuncia',
  FOLLOW_UP: 'Seguimiento',
  SPECIAL: 'Especial'
};

const STATUS_CONFIG = {
  SCHEDULED: { label: 'Programada', variant: 'secondary', icon: Clock },
  IN_PROGRESS: { label: 'En Progreso', variant: 'info', icon: Clock },
  COMPLETED: { label: 'Completada', variant: 'success', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', variant: 'destructive', icon: AlertTriangle }
};

export default function InspectionTable({ onView, onEdit }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      // Placeholder - backend endpoint needs to be created
      // const response = await api.get('/tax/inspections');
      // setInspections(response.data.data || response.data);
      setInspections([]);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount || 0);
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = 
      inspection.inspectionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.business?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspectorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesType = typeFilter === 'all' || inspection.inspectionType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Cargando inspecciones fiscales...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Inspecciones Fiscales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por número, negocio o inspector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(INSPECTION_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay inspecciones registradas</p>
            <p className="text-sm mt-2">
              Las inspecciones fiscales se programan para verificar el cumplimiento tributario
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Negocio</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Hallazgos</TableHead>
                  <TableHead>Multa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection) => {
                  const StatusIcon = STATUS_CONFIG[inspection.status]?.icon || Clock;
                  return (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">
                        {inspection.inspectionNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {inspection.business?.businessName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {inspection.business?.licenseNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {INSPECTION_TYPES[inspection.inspectionType] || inspection.inspectionType}
                      </TableCell>
                      <TableCell>{formatDate(inspection.inspectionDate)}</TableCell>
                      <TableCell>{inspection.inspectorName}</TableCell>
                      <TableCell>
                        {inspection.violations ? (
                          <Badge variant="destructive">
                            {inspection.violations.split(',').length} Infracciones
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Sin hallazgos</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {inspection.hasFine ? (
                          <span className="font-medium text-red-600">
                            {formatCurrency(inspection.fineAmount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONFIG[inspection.status]?.variant || 'secondary'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_CONFIG[inspection.status]?.label || inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView?.(inspection)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
