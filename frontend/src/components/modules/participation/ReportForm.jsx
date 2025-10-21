'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, MapPin, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REPORT_TYPES, REPORT_TYPE_LABELS } from '@/constants';
import { createReport } from '@/services/participation.service';

/**
 * Formulario para crear reportes ciudadanos
 */
export default function ReportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    address: '',
    latitude: null,
    longitude: null,
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
  });

  /**
   * Obtener ubicación actual del navegador
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLoading(false);
        setSuccess('Ubicación obtenida correctamente');
        setTimeout(() => setSuccess(null), 3000);
      },
      (error) => {
        setLoading(false);
        setError('No se pudo obtener la ubicación. Por favor, ingresa la dirección manualmente.');
      }
    );
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  /**
   * Manejar selección de imágenes
   */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar tamaño (máximo 5MB por imagen)
    const maxSize = 5 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        setError(`La imagen ${file.name} excede el tamaño máximo de 5MB`);
        return false;
      }
      return true;
    });

    // Limitar a 5 imágenes
    if (images.length + validFiles.length > 5) {
      setError('Máximo 5 imágenes permitidas');
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
  };

  /**
   * Eliminar imagen
   */
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!formData.type) {
      setError('Por favor selecciona el tipo de reporte');
      return;
    }

    if (!formData.description.trim()) {
      setError('Por favor describe el problema');
      return;
    }

    if (!formData.address.trim() && (!formData.latitude || !formData.longitude)) {
      setError('Por favor proporciona una dirección o usa tu ubicación actual');
      return;
    }

    if (!formData.reporterEmail.trim()) {
      setError('Por favor proporciona tu correo electrónico para recibir actualizaciones');
      return;
    }

    try {
      setLoading(true);

      // Convertir imágenes a base64
      const imagePromises = images.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);

      // Enviar reporte
      const reportData = {
        ...formData,
        images: imageUrls,
      };

      const response = await createReport(reportData);

      setSuccess(`¡Reporte creado exitosamente! Tu número de ticket es: ${response.data.ticketNumber}`);
      
      // Redirigir a la página de seguimiento después de 3 segundos
      setTimeout(() => {
        router.push(`/reportes/seguimiento?ticket=${response.data.ticketNumber}`);
      }, 3000);
    } catch (err) {
      console.error('Error creating report:', err);
      setError(err.response?.data?.message || 'Error al crear el reporte. Por favor intenta nuevamente.');
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

      {/* Tipo de reporte */}
      <div className="space-y-2">
        <Label htmlFor="type">
          Tipo de problema <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo de problema" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción del problema <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe detalladamente el problema que estás reportando..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Ubicación */}
      <div className="space-y-4">
        <Label>Ubicación del problema</Label>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Usar mi ubicación actual
          </Button>
          
          {formData.latitude && formData.longitude && (
            <div className="flex items-center text-sm text-green-600">
              ✓ Ubicación obtenida
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">O ingresa la dirección manualmente</Label>
          <Input
            id="address"
            placeholder="Ej: Av. Principal, entre calles 1 y 2, Sector Centro"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        {formData.latitude && formData.longitude && (
          <div className="text-xs text-gray-500">
            Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </div>
        )}
      </div>

      {/* Imágenes */}
      <div className="space-y-2">
        <Label htmlFor="images">Fotografías (opcional, máximo 5)</Label>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('images').click()}
              disabled={images.length >= 5}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Subir imágenes
            </Button>
            <span className="text-sm text-gray-500">
              {images.length}/5 imágenes
            </span>
          </div>

          {/* Preview de imágenes */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-medium">Tus datos de contacto</h3>
        <p className="text-sm text-gray-600">
          Te mantendremos informado sobre el estado de tu reporte
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reporterName">Nombre completo (opcional)</Label>
            <Input
              id="reporterName"
              placeholder="Tu nombre"
              value={formData.reporterName}
              onChange={(e) => handleChange('reporterName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterEmail">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reporterEmail"
              type="email"
              placeholder="tu@email.com"
              value={formData.reporterEmail}
              onChange={(e) => handleChange('reporterEmail', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterPhone">Teléfono (opcional)</Label>
            <Input
              id="reporterPhone"
              type="tel"
              placeholder="0414-1234567"
              value={formData.reporterPhone}
              onChange={(e) => handleChange('reporterPhone', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Botón de envío */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar reporte'}
        </Button>
      </div>
    </form>
  );
}
