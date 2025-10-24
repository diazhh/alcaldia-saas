'use client';

import { useProgressReportsByProject } from '@/hooks/useProgressReports';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProgressReportList({ projectId }) {
  const { data, isLoading, error } = useProgressReportsByProject(projectId, 1, 20);

  if (isLoading) {
    return <div className="text-center py-4">Cargando reportes...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error al cargar reportes: {error.message}</div>;
  }

  const reports = data?.reports || [];

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay reportes de avance registrados para este proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold">{report.reportNumber}</h3>
              <p className="text-sm text-gray-600">
                Período: {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Reportado por</p>
              <p className="text-sm font-medium">
                {report.reporter?.firstName} {report.reporter?.lastName}
              </p>
              <p className="text-xs text-gray-500">{formatDate(report.reportDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Avance Físico</p>
              <p className="text-2xl font-bold">{report.physicalProgress}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avance Planificado</p>
              <p className="text-2xl font-bold text-gray-600">{report.plannedProgress}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Variación</p>
              <p className={`text-2xl font-bold ${report.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {report.variance >= 0 ? '+' : ''}{report.variance}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monto Acumulado</p>
              <p className="text-lg font-bold">{formatCurrency(report.accumulatedAmount)}</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Avance Real vs Planificado</span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-4">
              <div
                className="absolute bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(report.plannedProgress, 100)}%` }}
              />
              <div
                className={`absolute h-4 rounded-full transition-all ${report.variance >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${Math.min(report.physicalProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-blue-600">Planificado: {report.plannedProgress}%</span>
              <span className={report.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                Real: {report.physicalProgress}%
              </span>
            </div>
          </div>

          {report.activitiesCompleted && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1 font-medium">Actividades Completadas:</p>
              <p className="text-sm whitespace-pre-line">{report.activitiesCompleted}</p>
            </div>
          )}

          {report.issues && (
            <div className="bg-yellow-50 p-3 rounded mb-2">
              <p className="text-xs text-yellow-700 mb-1 font-medium">Problemas Identificados:</p>
              <p className="text-sm text-yellow-900">{report.issues}</p>
            </div>
          )}

          {report.risks && (
            <div className="bg-red-50 p-3 rounded mb-2">
              <p className="text-xs text-red-700 mb-1 font-medium">Riesgos:</p>
              <p className="text-sm text-red-900">{report.risks}</p>
            </div>
          )}

          {report.weatherConditions && (
            <div className="text-xs text-gray-600 mt-2">
              Condiciones climáticas: {report.weatherConditions} | Días trabajados: {report.workDays}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
