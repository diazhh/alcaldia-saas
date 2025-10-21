'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getInventoryItems, 
  getLowStockItems,
  getInventoryEntries,
  getInventoryExits 
} from '@/services/assets.service';
import InventoryItemDialog from '@/components/modules/assets/InventoryItemDialog';
import InventoryEntryDialog from '@/components/modules/assets/InventoryEntryDialog';
import InventoryExitDialog from '@/components/modules/assets/InventoryExitDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function WarehousePage() {
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [entries, setEntries] = useState([]);
  const [exits, setExits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (activeTab === 'items') {
      fetchItems();
      fetchLowStockItems();
    } else if (activeTab === 'entries') {
      fetchEntries();
    } else if (activeTab === 'exits') {
      fetchExits();
    }
  }, [activeTab, pagination.page]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;

      const response = await getInventoryItems(params);
      setItems(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Error al cargar items');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const items = await getLowStockItems();
      setLowStockItems(items || []);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await getInventoryEntries(params);
      setEntries(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Error al cargar entradas');
    } finally {
      setLoading(false);
    }
  };

  const fetchExits = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await getInventoryExits(params);
      setExits(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching exits:', error);
      toast.error('Error al cargar salidas');
    } finally {
      setLoading(false);
    }
  };

  const handleItemDialogClose = (refresh) => {
    setItemDialogOpen(false);
    setSelectedItem(null);
    if (refresh) {
      fetchItems();
      fetchLowStockItems();
    }
  };

  const handleEntryDialogClose = (refresh) => {
    setEntryDialogOpen(false);
    if (refresh) {
      fetchEntries();
      fetchItems();
      fetchLowStockItems();
    }
  };

  const handleExitDialogClose = (refresh) => {
    setExitDialogOpen(false);
    if (refresh) {
      fetchExits();
      fetchItems();
      fetchLowStockItems();
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchItems();
  };

  const getStockStatus = (item) => {
    if (item.currentStock <= item.minimumStock) {
      return { label: 'Crítico', color: 'bg-red-100 text-red-800' };
    } else if (item.currentStock <= item.minimumStock * 1.5) {
      return { label: 'Bajo', color: 'bg-yellow-100 text-yellow-800' };
    } else if (item.currentStock >= item.maximumStock) {
      return { label: 'Exceso', color: 'bg-blue-100 text-blue-800' };
    }
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Almacén</h1>
          <p className="text-gray-600 mt-2">
            Control de inventario fungible y stock
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Alertas de Stock Bajo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-600">
                    Stock: {item.currentStock} / Mínimo: {item.minimumStock}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">
            <Package className="h-4 w-4 mr-2" />
            Items
          </TabsTrigger>
          <TabsTrigger value="entries">
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Entradas
          </TabsTrigger>
          <TabsTrigger value="exits">
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Salidas
          </TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-1 max-w-md">
              <Input
                placeholder="Buscar items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setItemDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Item
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">Cargando...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron items
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Stock Actual</TableHead>
                        <TableHead>Stock Mín/Máx</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-sm">
                              {item.code}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>
                              {item.category || '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.currentStock} {item.unit}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {item.minimumStock} / {item.maximumStock}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.totalValue)}
                            </TableCell>
                            <TableCell>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Mostrando {items.length} de {pagination.total} items
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setEntryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Entrada
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">Cargando...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron entradas
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Fuente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Registrado por</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-sm">
                            {entry.entryCode}
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.item?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {entry.quantity} {entry.item?.unit}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {entry.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.entryDate ? format(new Date(entry.entryDate), 'dd/MM/yyyy', { locale: es }) : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {entry.registeredBy?.name || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Mostrando {entries.length} de {pagination.total} entradas
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exits Tab */}
        <TabsContent value="exits" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setExitDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Salida
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">Cargando...</div>
              ) : exits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron salidas
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Autorizado por</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exits.map((exit) => (
                        <TableRow key={exit.id}>
                          <TableCell className="font-mono text-sm">
                            {exit.exitCode}
                          </TableCell>
                          <TableCell className="font-medium">
                            {exit.item?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {exit.quantity} {exit.item?.unit}
                          </TableCell>
                          <TableCell>
                            {exit.department?.name || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {exit.exitDate ? format(new Date(exit.exitDate), 'dd/MM/yyyy', { locale: es }) : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {exit.authorizedBy?.name || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Mostrando {exits.length} de {pagination.total} salidas
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <InventoryItemDialog
        open={itemDialogOpen}
        onClose={handleItemDialogClose}
        item={selectedItem}
      />
      <InventoryEntryDialog
        open={entryDialogOpen}
        onClose={handleEntryDialogClose}
      />
      <InventoryExitDialog
        open={exitDialogOpen}
        onClose={handleExitDialogClose}
      />
    </div>
  );
}
