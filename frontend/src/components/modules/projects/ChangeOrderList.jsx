'use client';

import { useChangeOrdersByProject } from '@/hooks/useChangeOrders';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusColors = {
  SOLICITADO: 'bg-blue-100 text-blue-800',
  EN_REVISION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  IMPLEMENTADO: 'bg-purple-100 text-purple-800',
};

const requesterLabels = {
  CLIENTE: 'Cliente',
  CONTRATISTA: 'Contratista',
  INSPECTOR: 'Inspector',
  OTRO: 'Otro',
};

export default function ChangeOrderList({ projectId }) {
  const { data: orders, isLoading, error } = useChangeOrdersByProject(projectId);

  if (isLoading) {
    return <div className="text-center py-4">Cargando órdenes de cambio...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error al cargar órdenes de cambio: {error.message}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay órdenes de cambio registradas para este proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
              <p className="text-sm text-gray-600 mt-1">{order.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
              {order.status}
            </span>
          </div>

          <div className="bg-gray-50 p-3 rounded mb-3">
            <p className="text-xs text-gray-500 mb-1">Justificación:</p>
            <p className="text-sm">{order.justification}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500">Solicitado por</p>
              <p className="font-medium">{requesterLabels[order.requestedBy]}</p>
              {order.requester && (
                <p className="text-xs text-gray-600">
                  {order.requester.firstName} {order.requester.lastName}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Impacto en Costo</p>
              <p className={`font-medium text-lg ${parseFloat(order.costImpact) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {parseFloat(order.costImpact) >= 0 ? '+' : ''}{formatCurrency(order.costImpact)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Impacto en Tiempo</p>
              <p className={`font-medium text-lg ${order.timeImpact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {order.timeImpact >= 0 ? '+' : ''}{order.timeImpact} días
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha de Solicitud</p>
              <p className="font-medium">{formatDate(order.requestDate)}</p>
            </div>
          </div>

          {order.reviewNotes && (
            <div className="bg-blue-50 p-3 rounded mb-2">
              <p className="text-xs text-blue-700 mb-1 font-medium">Notas de Revisión:</p>
              <p className="text-sm text-blue-900">{order.reviewNotes}</p>
              {order.reviewer && (
                <p className="text-xs text-blue-600 mt-1">
                  Revisado por: {order.reviewer.firstName} {order.reviewer.lastName}
                </p>
              )}
            </div>
          )}

          {order.rejectionReason && (
            <div className="bg-red-50 p-3 rounded">
              <p className="text-xs text-red-700 mb-1 font-medium">Razón de Rechazo:</p>
              <p className="text-sm text-red-900">{order.rejectionReason}</p>
            </div>
          )}

          {order.status === 'APROBADO' && order.approvalDate && (
            <div className="mt-2 text-xs text-green-600">
              Aprobado el {formatDate(order.approvalDate)}
              {order.approver && ` por ${order.approver.firstName} ${order.approver.lastName}`}
            </div>
          )}

          {order.status === 'IMPLEMENTADO' && order.implementationDate && (
            <div className="mt-2 text-xs text-purple-600">
              Implementado el {formatDate(order.implementationDate)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
