'use client';

import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const photoTypeOptions = [
  { value: 'BEFORE', label: 'Antes' },
  { value: 'DURING', label: 'Durante' },
  { value: 'AFTER', label: 'Después' },
];

/**
 * Componente para subir fotos del proyecto
 * @param {Function} onUpload - Callback al subir foto
 * @param {boolean} isLoading - Estado de carga
 */
export default function PhotoUpload({ onUpload, isLoading = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoData, setPhotoData] = useState({
    type: 'DURING',
    caption: '',
    takenAt: new Date().toISOString().split('T')[0],
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('type', photoData.type);
    formData.append('caption', photoData.caption);
    formData.append('takenAt', new Date(photoData.takenAt).toISOString());

    onUpload(formData);
    
    // Limpiar formulario
    setSelectedFile(null);
    setPreview(null);
    setPhotoData({
      type: 'DURING',
      caption: '',
      takenAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Nueva Foto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Suelta la imagen aquí...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Arrastra una imagen aquí, o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG o WEBP (máx. 5MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Metadatos */}
          {selectedFile && (
            <>
              <div>
                <Label htmlFor="type">Tipo de Foto *</Label>
                <Select
                  value={photoData.type}
                  onValueChange={(value) =>
                    setPhotoData({ ...photoData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {photoTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="caption">Descripción</Label>
                <Textarea
                  id="caption"
                  value={photoData.caption}
                  onChange={(e) =>
                    setPhotoData({ ...photoData, caption: e.target.value })
                  }
                  placeholder="Descripción de la foto..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="takenAt">Fecha de la Foto *</Label>
                <Input
                  id="takenAt"
                  type="date"
                  value={photoData.takenAt}
                  onChange={(e) =>
                    setPhotoData({ ...photoData, takenAt: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Subir Foto
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

PhotoUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
