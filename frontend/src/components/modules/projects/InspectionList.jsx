'use client';

import { useInspectionsByProject } from '@/hooks/useInspections';
import { formatDate } from '@/lib/utils';

const statusColors = {
  PROGRAMADA: 'bg-blue-100 text-blue-800',
  REALIZADA: 'bg-green-100 text-green-800',
  CON_SEGUIMIENTO: 'bg-yellow-100 text-yellow-800',
  CERRADA: 'bg-gray-100 text-gray-800',
};

const resultColors = {
  APROBADO: 'bg-green-100 text-green-800',
  CON_OBSERVACIONES: 'bg-yellow-100 text-yellow-800',
  RECHAZADO: 'bg-red-100 text-red-800',
};

const typeLabels = {
  TECNICA: 'Técnica',
  CALIDAD: 'Calidad',
  SEGURIDAD: 'Seguridad',
  PROVISIONAL: 'Provisional',
  FINAL: 'Final',
};

export default function InspectionList({ projectId }) {
  const { data: inspections, isLoading, error } = useInspectionsByProject(projectId);

  if (isLoading) {
    return <div className="text-center py-4">Cargando inspecciones...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error al cargar inspecciones: {error.message}</div>;
  }

  if (!inspections || inspections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay inspecciones registradas para este proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inspections.map((inspection) => (
        <div key={inspection.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold">{inspection.inspectionNumber}</h3>
              <p className="text-sm text-gray-600">Tipo: {typeLabels[inspection.type]}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[inspection.status]}`}>
                {inspection.status}
              </span>
              {inspection.result && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${resultColors[inspection.result]}`}>
                  {inspection.result}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500">Programada</p>
              <p className="font-medium">{formatDate(inspection.scheduledDate)}</p>
            </div>
            {inspection.completedDate && (
              <div>
                <p className="text-xs text-gray-500">Completada</p>
                <p className="font-medium">{formatDate(inspection.completedDate)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Inspector</p>
              <p className="font-medium">
                {inspection.inspector?.firstName} {inspection.inspector?.lastName}
              </p>
            </div>
          </div>

          {inspection.observations && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Observaciones:</p>
              <p className="text-sm">{inspection.observations}</p>
            </div>
          )}

          {inspection.nonConformities && (
            <div className="mb-2 bg-yellow-50 p-3 rounded">
              <p className="text-xs text-yellow-700 mb-1 font-medium">No Conformidades:</p>
              <p className="text-sm text-yellow-900">{inspection.nonConformities}</p>
            </div>
          )}

          {inspection.correctiveActions && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-blue-700 mb-1 font-medium">Acciones Correctivas:</p>
              <p className="text-sm text-blue-900">{inspection.correctiveActions}</p>
            </div>
          )}

          {inspection.followUpRequired && (
            <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Requiere seguimiento {inspection.followUpDate && `para el ${formatDate(inspection.followUpDate)}`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
