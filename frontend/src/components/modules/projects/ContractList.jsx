'use client';

import { useContractsByProject } from '@/hooks/useContracts';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusColors = {
  BORRADOR: 'bg-gray-100 text-gray-800',
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  ADJUDICADO: 'bg-purple-100 text-purple-800',
  FIRMADO: 'bg-green-100 text-green-800',
  EN_EJECUCION: 'bg-yellow-100 text-yellow-800',
  FINALIZADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const statusLabels = {
  BORRADOR: 'Borrador',
  EN_PROCESO: 'En Proceso',
  ADJUDICADO: 'Adjudicado',
  FIRMADO: 'Firmado',
  EN_EJECUCION: 'En Ejecución',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

export default function ContractList({ projectId }) {
  const { data: contracts, isLoading, error } = useContractsByProject(projectId);

  if (isLoading) {
    return <div className="text-center py-4">Cargando contratos...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error al cargar contratos: {error.message}</div>;
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay contratos registrados para este proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <div key={contract.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{contract.contractNumber}</h3>
              <p className="text-sm text-gray-600">{contract.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[contract.status]}`}>
              {statusLabels[contract.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500">Contratista</p>
              <p className="font-medium">{contract.contractor?.name || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monto del Contrato</p>
              <p className="font-medium text-lg">{formatCurrency(contract.contractAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monto Pagado</p>
              <p className="font-medium text-green-600">{formatCurrency(contract.paidAmount)}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progreso de Pago</span>
              <span>{Math.round((parseFloat(contract.paidAmount) / parseFloat(contract.contractAmount)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((parseFloat(contract.paidAmount) / parseFloat(contract.contractAmount)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {contract.signedDate && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Firma:</span>{' '}
                <span className="font-medium">{formatDate(contract.signedDate)}</span>
              </div>
              {contract.startDate && (
                <div>
                  <span className="text-gray-500">Inicio:</span>{' '}
                  <span className="font-medium">{formatDate(contract.startDate)}</span>
                </div>
              )}
              {contract.endDate && (
                <div>
                  <span className="text-gray-500">Fin:</span>{' '}
                  <span className="font-medium">{formatDate(contract.endDate)}</span>
                </div>
              )}
              {contract.advancePaymentPercent && (
                <div>
                  <span className="text-gray-500">Anticipo:</span>{' '}
                  <span className="font-medium">{contract.advancePaymentPercent}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
