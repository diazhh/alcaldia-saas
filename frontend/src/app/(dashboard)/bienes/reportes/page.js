'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getAssetStats, 
  getInventoryStats, 
  getPurchaseRequestStats,
  getMaintenanceStats 
} from '@/services/assets.service';

export default function AssetsReportsPage() {
  const [loading, setLoading] = useState(true);
  const [assetStats, setAssetStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [purchaseStats, setPurchaseStats] = useState(null);
  const [maintenanceStats, setMaintenanceStats] = useState(null);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [assets, inventory, purchases, maintenance] = await Promise.all([
        getAssetStats().catch(() => null),
        getInventoryStats().catch(() => null),
        getPurchaseRequestStats().catch(() => null),
        getMaintenanceStats().catch(() => null),
      ]);

      setAssetStats(assets);
      setInventoryStats(inventory);
      setPurchaseStats(purchases);
      setMaintenanceStats(maintenance);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-VE').format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-2">
            Análisis patrimonial y gestión de bienes municipales
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Assets Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Patrimonio Municipal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total de Bienes</CardDescription>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(assetStats?.totalAssets || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Bienes registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Valor Total</CardDescription>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(assetStats?.totalValue || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Valor patrimonial
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Bienes Activos</CardDescription>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {formatNumber(assetStats?.activeAssets || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                En operación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>En Mantenimiento</CardDescription>
                <Wrench className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {formatNumber(assetStats?.inMaintenance || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Inventario de Almacén</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Items Totales</CardDescription>
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(inventoryStats?.totalItems || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Tipos de items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Valor en Stock</CardDescription>
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                {formatCurrency(inventoryStats?.totalValue || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Valor total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Stock Bajo</CardDescription>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {formatNumber(inventoryStats?.lowStockItems || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Requieren reposición
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Items Activos</CardDescription>
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600">
                {formatNumber(inventoryStats?.activeItems || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                En circulación
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Requests Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Solicitudes de Compra</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Solicitudes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(purchaseStats?.totalRequests || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {formatNumber(purchaseStats?.pendingRequests || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Aprobadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(purchaseStats?.approvedRequests || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Monto Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(purchaseStats?.totalAmount || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Maintenance Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mantenimientos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Mantenimientos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(maintenanceStats?.totalMaintenances || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Programados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatNumber(maintenanceStats?.scheduledMaintenances || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En Progreso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {formatNumber(maintenanceStats?.inProgressMaintenances || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Costo Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(maintenanceStats?.totalCost || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribution by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Bien</CardTitle>
            <CardDescription>Cantidad de bienes por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assetStats?.byType?.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.type}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(item.count / assetStats.totalAssets) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{item.count}</span>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay datos disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Bienes</CardTitle>
            <CardDescription>Distribución por estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assetStats?.byStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.status}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(item.count / assetStats.totalAssets) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{item.count}</span>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay datos disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
