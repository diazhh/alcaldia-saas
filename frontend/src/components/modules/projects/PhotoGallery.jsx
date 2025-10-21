'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, ZoomIn, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const photoTypeLabels = {
  BEFORE: 'Antes',
  DURING: 'Durante',
  AFTER: 'Después',
};

const photoTypeColors = {
  BEFORE: 'bg-blue-100 text-blue-800',
  DURING: 'bg-yellow-100 text-yellow-800',
  AFTER: 'bg-green-100 text-green-800',
};

/**
 * Componente de galería de fotos del proyecto
 * @param {Array} photos - Lista de fotos
 * @param {Function} onDelete - Callback para eliminar foto
 */
export default function PhotoGallery({ photos, onDelete }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!photos || photos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No hay fotos registradas para este proyecto
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative group">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto del proyecto'}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                <Badge className={photoTypeColors[photo.type]}>
                  {photoTypeLabels[photo.type]}
                </Badge>
                
                {photo.caption && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {photo.caption}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(photo.takenAt), 'dd/MM/yyyy', { locale: es })}
                </div>

                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={() => onDelete(photo.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de vista ampliada */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPhoto?.caption || 'Foto del proyecto'}
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Foto del proyecto'}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              
              <div className="flex items-center justify-between">
                <Badge className={photoTypeColors[selectedPhoto.type]}>
                  {photoTypeLabels[selectedPhoto.type]}
                </Badge>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(selectedPhoto.takenAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </div>
              </div>
              
              {selectedPhoto.caption && (
                <p className="text-gray-700">{selectedPhoto.caption}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

PhotoGallery.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      caption: PropTypes.string,
      type: PropTypes.string.isRequired,
      takenAt: PropTypes.string.isRequired,
    })
  ),
  onDelete: PropTypes.func,
};
