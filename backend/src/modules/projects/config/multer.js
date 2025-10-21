import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio de uploads para proyectos si no existe
const uploadDir = './public/uploads/projects';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configuración de almacenamiento para fotos de proyectos
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  },
});

/**
 * Filtro para solo permitir imágenes
 */
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
};

/**
 * Configuración de Multer para fotos de proyectos
 */
export const uploadProjectPhoto = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: imageFilter,
});

export default uploadProjectPhoto;
