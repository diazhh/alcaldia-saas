'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createProposal } from '@/services/participation.service';

/**
 * Formulario para crear propuestas de presupuesto participativo
 */
export default function ProposalForm({ budgetId, maxBudget }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    justification: '',
    estimatedCost: '',
    beneficiaries: '',
    location: '',
    proposerName: '',
    proposerEmail: '',
    proposerPhone: '',
    proposerAddress: '',
  });

  /**
   * Manejar cambios en el formulario
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
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
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!formData.title.trim()) {
      setError('Por favor ingresa el título de la propuesta');
      return;
    }

    if (!formData.description.trim()) {
      setError('Por favor describe la propuesta');
      return;
    }

    if (!formData.justification.trim()) {
      setError('Por favor justifica por qué es importante esta propuesta');
      return;
    }

    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      setError('Por favor ingresa un costo estimado válido');
      return;
    }

    if (maxBudget && parseFloat(formData.estimatedCost) > maxBudget) {
      setError(`El costo estimado no puede exceder ${formatCurrency(maxBudget)}`);
      return;
    }

    if (!formData.proposerName.trim() || !formData.proposerEmail.trim()) {
      setError('Por favor completa tus datos de contacto');
      return;
    }

    try {
      setLoading(true);

      const proposalData = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost),
        beneficiaries: parseInt(formData.beneficiaries) || null,
      };

      await createProposal(budgetId, proposalData);

      setSuccess(
        '¡Propuesta enviada exitosamente! Será evaluada por el equipo técnico antes de pasar a votación.'
      );

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push(`/presupuesto-participativo/${budgetId}`);
      }, 3000);
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError(
        err.response?.data?.message ||
          'Error al enviar la propuesta. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Información del proyecto */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Información del Proyecto</h3>

        <div className="space-y-2">
          <Label htmlFor="title">
            Título de la propuesta <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Ej: Construcción de cancha deportiva en el Sector Los Pinos"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Descripción detallada <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe en detalle qué se va a hacer, cómo beneficiará a la comunidad, etc."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={5}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="justification">
            Justificación <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="justification"
            placeholder="Explica por qué es importante este proyecto para tu comunidad"
            value={formData.justification}
            onChange={(e) => handleChange('justification', e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">
              Costo estimado (Bs.) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', e.target.value)}
                className="pl-10"
              />
            </div>
            {maxBudget && (
              <p className="text-xs text-gray-500">
                Presupuesto máximo disponible: {formatCurrency(maxBudget)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiaries">
              Número de beneficiarios estimados (opcional)
            </Label>
            <Input
              id="beneficiaries"
              type="number"
              min="0"
              placeholder="Ej: 500"
              value={formData.beneficiaries}
              onChange={(e) => handleChange('beneficiaries', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicación del proyecto (opcional)</Label>
          <Input
            id="location"
            placeholder="Ej: Sector Los Pinos, entre calles 1 y 2"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>
      </div>

      {/* Información del proponente */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-lg">Tus Datos</h3>
        <p className="text-sm text-gray-600">
          Esta información será utilizada para contactarte sobre tu propuesta
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proposerName">
              Nombre completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="proposerName"
              placeholder="Tu nombre completo"
              value={formData.proposerName}
              onChange={(e) => handleChange('proposerName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposerEmail">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="proposerEmail"
              type="email"
              placeholder="tu@email.com"
              value={formData.proposerEmail}
              onChange={(e) => handleChange('proposerEmail', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposerPhone">Teléfono (opcional)</Label>
            <Input
              id="proposerPhone"
              type="tel"
              placeholder="0414-1234567"
              value={formData.proposerPhone}
              onChange={(e) => handleChange('proposerPhone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposerAddress">Dirección (opcional)</Label>
            <Input
              id="proposerAddress"
              placeholder="Tu dirección"
              value={formData.proposerAddress}
              onChange={(e) => handleChange('proposerAddress', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar propuesta'}
        </Button>
      </div>
    </form>
  );
}
