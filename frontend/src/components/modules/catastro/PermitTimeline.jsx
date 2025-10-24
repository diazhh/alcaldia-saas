'use client';

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  FileText,
  Hammer,
  Ban
} from 'lucide-react';

/**
 * Componente Timeline para visualizar el estado de un permiso de construcción
 */
export default function PermitTimeline({ permit }) {
  // Definir los pasos del timeline según el estado del permiso
  const getTimelineSteps = () => {
    const steps = [
      {
        id: 'submitted',
        label: 'Solicitud Presentada',
        date: permit.applicationDate,
        status: 'completed',
        icon: FileText,
      },
    ];

    // Agregar revisión técnica si existe
    if (permit.reviewDate) {
      steps.push({
        id: 'review',
        label: 'Revisión Técnica',
        date: permit.reviewDate,
        status: permit.meetsCompliance ? 'completed' : 'warning',
        icon: FileText,
        details: permit.technicalReview,
        reviewer: permit.reviewedBy,
      });
    }

    // Agregar aprobación/rechazo
    if (permit.status === 'APPROVED' || permit.status === 'IN_CONSTRUCTION' || permit.status === 'COMPLETED') {
      steps.push({
        id: 'approved',
        label: 'Permiso Aprobado',
        date: permit.approvalDate,
        status: 'completed',
        icon: CheckCircle,
        approver: permit.approvedBy,
      });
    } else if (permit.status === 'REJECTED') {
      steps.push({
        id: 'rejected',
        label: 'Permiso Rechazado',
        date: permit.rejectionDate,
        status: 'error',
        icon: XCircle,
        details: permit.rejectionReason,
      });
    } else if (permit.status === 'CORRECTIONS_REQUIRED') {
      steps.push({
        id: 'corrections',
        label: 'Requiere Correcciones',
        date: permit.reviewDate,
        status: 'warning',
        icon: AlertCircle,
        details: permit.technicalReview,
      });
    } else if (permit.status === 'UNDER_REVIEW') {
      steps.push({
        id: 'under_review',
        label: 'En Revisión',
        date: new Date(),
        status: 'current',
        icon: Clock,
      });
    }

    // Agregar inicio de construcción si existe
    if (permit.constructionStartDate) {
      steps.push({
        id: 'construction_start',
        label: 'Inicio de Construcción',
        date: permit.constructionStartDate,
        status: 'completed',
        icon: Hammer,
      });
    }

    // Agregar finalización si existe
    if (permit.constructionEndDate) {
      steps.push({
        id: 'construction_end',
        label: 'Obra Completada',
        date: permit.constructionEndDate,
        status: 'completed',
        icon: CheckCircle,
        details: permit.finalInspectionNotes,
      });
    }

    // Agregar vencimiento si está vencido
    if (permit.status === 'EXPIRED') {
      steps.push({
        id: 'expired',
        label: 'Permiso Vencido',
        date: permit.expirationDate,
        status: 'error',
        icon: Ban,
      });
    }

    // Agregar cancelación si está cancelado
    if (permit.status === 'CANCELLED') {
      steps.push({
        id: 'cancelled',
        label: 'Permiso Cancelado',
        date: permit.updatedAt,
        status: 'error',
        icon: XCircle,
      });
    }

    return steps;
  };

  const steps = getTimelineSteps();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-blue-500 border-blue-500 animate-pulse';
      case 'warning':
        return 'bg-yellow-500 border-yellow-500';
      case 'error':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  };

  const getTextColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'current':
        return 'text-blue-700';
      case 'warning':
        return 'text-yellow-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="py-6">
      <h3 className="text-lg font-semibold mb-6">Timeline del Permiso</h3>
      
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="relative flex items-start">
                {/* Icono */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${getStatusColor(step.status)}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Contenido */}
                <div className="ml-6 flex-1">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${getTextColor(step.status)}`}>
                        {step.label}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(step.date)}
                      </span>
                    </div>

                    {step.details && (
                      <p className="text-sm text-gray-600 mb-2">
                        {step.details}
                      </p>
                    )}

                    {step.reviewer && (
                      <p className="text-xs text-gray-500">
                        Revisado por: <span className="font-medium">{step.reviewer}</span>
                      </p>
                    )}

                    {step.approver && (
                      <p className="text-xs text-gray-500">
                        Aprobado por: <span className="font-medium">{step.approver}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
