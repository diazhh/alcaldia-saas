'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BUDGET_STATUS, BUDGET_STATUS_LABELS } from '@/constants';
import { listParticipatoryBudgets, getBudgetStats } from '@/services/participation.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Página de gestión de presupuesto participativo
 */
export default function PresupuestoParticipativoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar presupuestos
   */
  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await listParticipatoryBudgets({ limit: 100 });
      setBudgets(response.data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los presupuestos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * Obtener color del badge según estado
   */
  const getStatusColor = (status) => {
    switch (status) {
      case BUDGET_STATUS.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case BUDGET_STATUS.OPEN_PROPOSALS:
        return 'bg-blue-100 text-blue-800';
      case BUDGET_STATUS.EVALUATION:
        return 'bg-yellow-100 text-yellow-800';
      case BUDGET_STATUS.VOTING:
        return 'bg-green-100 text-green-800';
      case BUDGET_STATUS.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Calcular estadísticas
   */
  const stats = {
    total: budgets.length,
    active: budgets.filter(
      (b) =>
        b.status === BUDGET_STATUS.OPEN_PROPOSALS ||
        b.status === BUDGET_STATUS.VOTING
    ).length,
    closed: budgets.filter((b) => b.status === BUDGET_STATUS.CLOSED).length,
    totalBudget: budgets.reduce((sum, b) => sum + (b.totalBudget || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Presupuesto Participativo</h1>
          <p className="text-gray-600 mt-1">
            Gestión de convocatorias y propuestas ciudadanas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadBudgets} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Convocatoria
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Convocatorias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-gray-600">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.closed}</p>
                <p className="text-sm text-gray-600">Cerradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalBudget)}
                </p>
                <p className="text-sm text-gray-600">Presupuesto Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de convocatorias */}
      <Card>
        <CardHeader>
          <CardTitle>Convocatorias</CardTitle>
          <CardDescription>
            Listado de todas las convocatorias de presupuesto participativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Propuestas</TableHead>
                  <TableHead>Período Propuestas</TableHead>
                  <TableHead>Período Votación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando convocatorias...
                    </TableCell>
                  </TableRow>
                ) : budgets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No hay convocatorias creadas
                    </TableCell>
                  </TableRow>
                ) : (
                  budgets.map((budget) => (
                    <TableRow
                      key={budget.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        router.push(`/participacion/presupuesto/${budget.id}`)
                      }
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{budget.name}</p>
                          <p className="text-sm text-gray-500 max-w-md truncate">
                            {budget.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(budget.status)}>
                          {BUDGET_STATUS_LABELS[budget.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(budget.totalBudget)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {budget._count?.proposals || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(budget.proposalStartDate)} -{' '}
                          {formatDate(budget.proposalEndDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(budget.votingStartDate)} -{' '}
                          {formatDate(budget.votingEndDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/participacion/presupuesto/${budget.id}`);
                          }}
                        >
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
