'use client';

import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BUDGET_STATUS, BUDGET_STATUS_LABELS } from '@/constants';

/**
 * Lista de convocatorias de presupuesto participativo
 */
export default function BudgetList({ budgets, loading }) {
  const router = useRouter();

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
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
   * Verificar si se pueden enviar propuestas
   */
  const canSubmitProposals = (budget) => {
    return budget.status === BUDGET_STATUS.OPEN_PROPOSALS;
  };

  /**
   * Verificar si se puede votar
   */
  const canVote = (budget) => {
    return budget.status === BUDGET_STATUS.VOTING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando convocatorias...</p>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">No hay convocatorias disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {budgets.map((budget) => (
        <Card key={budget.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{budget.name}</CardTitle>
                <CardDescription>{budget.description}</CardDescription>
              </div>
              <Badge className={getStatusColor(budget.status)}>
                {BUDGET_STATUS_LABELS[budget.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información clave */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Presupuesto</p>
                  <p className="font-medium">{formatCurrency(budget.totalBudget)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Propuestas</p>
                  <p className="font-medium">{budget._count?.proposals || 0}</p>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-2 text-sm">
              {budget.proposalStartDate && budget.proposalEndDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Propuestas: {formatDate(budget.proposalStartDate)} -{' '}
                    {formatDate(budget.proposalEndDate)}
                  </span>
                </div>
              )}
              {budget.votingStartDate && budget.votingEndDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    Votación: {formatDate(budget.votingStartDate)} -{' '}
                    {formatDate(budget.votingEndDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/presupuesto-participativo/${budget.id}`)}
              >
                Ver detalles
              </Button>
              {canSubmitProposals(budget) && (
                <Button
                  className="flex-1"
                  onClick={() =>
                    router.push(`/presupuesto-participativo/${budget.id}/proponer`)
                  }
                >
                  Enviar propuesta
                </Button>
              )}
              {canVote(budget) && (
                <Button
                  className="flex-1"
                  onClick={() =>
                    router.push(`/presupuesto-participativo/${budget.id}/votar`)
                  }
                >
                  Votar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
