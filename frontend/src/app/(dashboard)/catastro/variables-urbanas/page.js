'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUrbanVariables, deleteUrbanVariable } from '@/services/catastro.service';
import UrbanVariableDialog from '@/components/modules/catastro/UrbanVariableDialog';

export default function UrbanVariablesPage() {
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState(null);

  useEffect(() => {
    fetchVariables();
  }, []);

  const fetchVariables = async () => {
    try {
      setLoading(true);
      const data = await getUrbanVariables();
      setVariables(data);
    } catch (error) {
      console.error('Error fetching urban variables:', error);
      toast.error('Error al cargar variables urbanas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta variable urbana?')) return;
    
    try {
      await deleteUrbanVariable(id);
      toast.success('Variable urbana eliminada exitosamente');
      fetchVariables();
    } catch (error) {
      console.error('Error deleting urban variable:', error);
      toast.error('Error al eliminar variable urbana');
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setSelectedVariable(null);
    if (refresh) fetchVariables();
  };

  const filteredVariables = variables.filter(variable => 
    variable.zoneCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.zoneName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getZoneTypeColor = (type) => {
    const colors = {
      RESIDENTIAL: 'bg-blue-100 text-blue-800',
      COMMERCIAL: 'bg-amber-100 text-amber-800',
      INDUSTRIAL: 'bg-purple-100 text-purple-800',
      MIXED: 'bg-pink-100 text-pink-800',
      PROTECTED: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getZoneTypeLabel = (type) => {
    const labels = {
      RESIDENTIAL: 'Residencial',
      COMMERCIAL: 'Comercial',
      INDUSTRIAL: 'Industrial',
      MIXED: 'Mixto',
      PROTECTED: 'Protegida',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Variables Urbanas</h1>
          <p className="text-gray-600 mt-2">
            Normativas urbanísticas por zona
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Variable Urbana
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Variables Urbanas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por código o nombre de zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Variables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Variables Urbanas Registradas</CardTitle>
          <CardDescription>
            {filteredVariables.length} zonas definidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando variables urbanas...</div>
          ) : filteredVariables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron variables urbanas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Retiros (m)</TableHead>
                    <TableHead>Altura Máx.</TableHead>
                    <TableHead>Usos Permitidos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVariables.map((variable) => (
                    <TableRow key={variable.id}>
                      <TableCell className="font-medium">
                        {variable.zoneCode}
                      </TableCell>
                      <TableCell>{variable.zoneName}</TableCell>
                      <TableCell>
                        <Badge className={getZoneTypeColor(variable.zoneType)}>
                          {getZoneTypeLabel(variable.zoneType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {variable.frontSetback && `F: ${variable.frontSetback}m `}
                          {variable.rearSetback && `P: ${variable.rearSetback}m `}
                          {variable.leftSetback && `I: ${variable.leftSetback}m `}
                          {variable.rightSetback && `D: ${variable.rightSetback}m`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {variable.maxHeight ? `${variable.maxHeight} m` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {Array.isArray(variable.allowedUses) 
                            ? variable.allowedUses.join(', ') 
                            : variable.allowedUses || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVariable(variable);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(variable.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Urban Variable Dialog */}
      <UrbanVariableDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        urbanVariable={selectedVariable}
      />
    </div>
  );
}
