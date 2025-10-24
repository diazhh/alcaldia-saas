'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

/**
 * Formulario para revisión técnica de permisos de construcción
 */
export default function PermitReviewForm({ permit, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    technicalReview: permit.technicalReview || '',
    meetsCompliance: permit.meetsCompliance ?? true,
    reviewedBy: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar revisión:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-6">Revisión Técnica del Permiso</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del permiso */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2">Información del Permiso</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Número:</span>
              <span className="ml-2 font-medium">{permit.permitNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <span className="ml-2 font-medium">{permit.permitType}</span>
            </div>
            <div>
              <span className="text-gray-600">Solicitante:</span>
              <span className="ml-2 font-medium">{permit.applicantName}</span>
            </div>
            <div>
              <span className="text-gray-600">Área estimada:</span>
              <span className="ml-2 font-medium">{permit.estimatedArea} m²</span>
            </div>
          </div>
        </div>

        {/* Cumplimiento de normativas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Cumple con las variables urbanas?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, meetsCompliance: true })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                formData.meetsCompliance
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Sí, cumple</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, meetsCompliance: false })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                !formData.meetsCompliance
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
              }`}
            >
              <XCircle className="w-5 h-5" />
              <span className="font-medium">No cumple</span>
            </button>
          </div>
        </div>

        {/* Observaciones técnicas */}
        <div>
          <label htmlFor="technicalReview" className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones Técnicas *
          </label>
          <textarea
            id="technicalReview"
            rows={6}
            required
            value={formData.technicalReview}
            onChange={(e) => setFormData({ ...formData, technicalReview: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              formData.meetsCompliance
                ? 'Describa los aspectos revisados y confirmados...'
                : 'Describa las no conformidades encontradas y correcciones requeridas...'
            }
          />
          <p className="mt-1 text-sm text-gray-500">
            Incluya detalles sobre retiros, alturas, densidad, uso del suelo, etc.
          </p>
        </div>

        {/* Revisor */}
        <div>
          <label htmlFor="reviewedBy" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Revisor *
          </label>
          <input
            type="text"
            id="reviewedBy"
            required
            value={formData.reviewedBy}
            onChange={(e) => setFormData({ ...formData, reviewedBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Ing. Juan Pérez"
          />
        </div>

        {/* Alerta si no cumple */}
        {!formData.meetsCompliance && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">El permiso requerirá correcciones</p>
              <p>
                Al marcar que no cumple con las normativas, el permiso pasará al estado
                "CORRECTIONS_REQUIRED" y se notificará al solicitante.
              </p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Revisión'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
