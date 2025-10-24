'use client';

import React, { useState } from 'react';
import { MapPin, Upload, X, AlertCircle } from 'lucide-react';

/**
 * Formulario público de denuncia ciudadana para control urbano
 */
export default function ComplaintForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    inspectionType: 'ILLEGAL_CONSTRUCTION',
    description: '',
    address: '',
    latitude: null,
    longitude: null,
    complainantName: '',
    complainantPhone: '',
    complainantEmail: '',
    isAnonymous: false,
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const inspectionTypes = [
    { value: 'ILLEGAL_CONSTRUCTION', label: 'Construcción Ilegal' },
    { value: 'INVASION', label: 'Invasión de Espacio Público' },
    { value: 'ZONING_VIOLATION', label: 'Violación de Zonificación' },
    { value: 'ENVIRONMENTAL', label: 'Problema Ambiental' },
    { value: 'SAFETY', label: 'Riesgo de Seguridad' },
    { value: 'COMPLAINT', label: 'Otra Denuncia' },
  ];

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar número máximo de fotos
    if (photos.length + files.length > 5) {
      setErrors({ ...errors, photos: 'Máximo 5 fotos permitidas' });
      return;
    }

    // Validar tamaño de archivos (máx 5MB cada uno)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setErrors({ ...errors, photos: 'Cada foto debe pesar menos de 5MB' });
      return;
    }

    setPhotos([...photos, ...files]);
    setErrors({ ...errors, photos: null });
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setErrors({ ...errors, location: 'No se pudo obtener la ubicación' });
        }
      );
    } else {
      setErrors({ ...errors, location: 'Geolocalización no disponible' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.isAnonymous) {
      if (!formData.complainantName.trim()) {
        newErrors.complainantName = 'El nombre es requerido';
      }
      if (!formData.complainantPhone.trim()) {
        newErrors.complainantPhone = 'El teléfono es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para envío
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Agregar fotos
      photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error al enviar denuncia:', error);
      setErrors({ submit: 'Error al enviar la denuncia. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Formulario de Denuncia Ciudadana
        </h2>
        <p className="text-gray-600">
          Reporte problemas de construcción ilegal, invasión de espacios públicos u otras
          irregularidades urbanas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de denuncia */}
        <div>
          <label htmlFor="inspectionType" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Problema *
          </label>
          <select
            id="inspectionType"
            value={formData.inspectionType}
            onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {inspectionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Problema *
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describa detalladamente el problema observado..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección o Ubicación *
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Av. Principal con Calle 5, Sector Centro"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Ubicación GPS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación GPS (Opcional)
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Usar mi ubicación actual
            </button>
            {formData.latitude && formData.longitude && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotografías (Máximo 5)
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">
                  Click para seleccionar fotos
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG hasta 5MB cada una
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                disabled={photos.length >= 5}
              />
            </label>

            {/* Preview de fotos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.photos && (
              <p className="text-sm text-red-600">{errors.photos}</p>
            )}
          </div>
        </div>

        {/* Denuncia anónima */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-gray-900">Denuncia Anónima</span>
              <p className="text-sm text-gray-600 mt-1">
                Marque esta opción si desea realizar la denuncia de forma anónima. No se
                solicitarán sus datos personales.
              </p>
            </div>
          </label>
        </div>

        {/* Datos del denunciante (si no es anónimo) */}
        {!formData.isAnonymous && (
          <div className="space-y-4 bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900">Datos de Contacto</h3>
            
            <div>
              <label htmlFor="complainantName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="complainantName"
                value={formData.complainantName}
                onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.complainantName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.complainantName && (
                <p className="mt-1 text-sm text-red-600">{errors.complainantName}</p>
              )}
            </div>

            <div>
              <label htmlFor="complainantPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                id="complainantPhone"
                value={formData.complainantPhone}
                onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.complainantPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+58 412-1234567"
              />
              {errors.complainantPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.complainantPhone}</p>
              )}
            </div>

            <div>
              <label htmlFor="complainantEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email (Opcional)
              </label>
              <input
                type="email"
                id="complainantEmail"
                value={formData.complainantEmail}
                onChange={(e) => setFormData({ ...formData, complainantEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
        )}

        {/* Alerta informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información importante</p>
            <p>
              Su denuncia será revisada por nuestro equipo técnico. Recibirá un número de
              seguimiento para consultar el estado de su caso.
            </p>
          </div>
        </div>

        {/* Error de envío */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Denuncia'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
