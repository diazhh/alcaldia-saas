'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getProperties, deleteProperty } from '@/services/catastro.service';
import PropertyCadastralDialog from '@/components/modules/catastro/PropertyCadastralDialog';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error al cargar propiedades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;
    
    try {
      await deleteProperty(id);
      toast.success('Propiedad eliminada exitosamente');
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Error al eliminar propiedad');
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setSelectedProperty(null);
    if (refresh) fetchProperties();
  };

  const filteredProperties = properties.filter(property => 
    property.cadastralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.taxpayer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUseColor = (use) => {
    const colors = {
      RESIDENTIAL: 'bg-blue-100 text-blue-800',
      COMMERCIAL: 'bg-amber-100 text-amber-800',
      INDUSTRIAL: 'bg-purple-100 text-purple-800',
      VACANT: 'bg-gray-100 text-gray-800',
    };
    return colors[use] || 'bg-gray-100 text-gray-800';
  };

  const getUseLabel = (use) => {
    const labels = {
      RESIDENTIAL: 'Residencial',
      COMMERCIAL: 'Comercial',
      INDUSTRIAL: 'Industrial',
      VACANT: 'Baldío',
    };
    return labels[use] || use;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Propiedades</h1>
          <p className="text-gray-600 mt-2">
            Administración de fichas catastrales
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código catastral, dirección o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Propiedades Registradas</CardTitle>
          <CardDescription>
            {filteredProperties.length} propiedades encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando propiedades...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron propiedades
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código Catastral</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Área Terreno</TableHead>
                    <TableHead>Área Construcción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        {property.cadastralCode}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          {property.latitude && property.longitude && (
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className="line-clamp-2">{property.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {property.taxpayer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getUseColor(property.propertyUse)}>
                          {getUseLabel(property.propertyUse)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {property.landArea ? `${property.landArea} m²` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {property.constructionArea ? `${property.constructionArea} m²` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedProperty(property);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(property.id)}
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

      {/* Property Dialog */}
      <PropertyCadastralDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        property={selectedProperty}
      />
    </div>
  );
}
