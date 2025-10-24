/**
 * Constantes de la aplicación
 */

// Roles del sistema
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DIRECTOR: 'DIRECTOR',
  COORDINADOR: 'COORDINADOR',
  EMPLEADO: 'EMPLEADO',
  CIUDADANO: 'CIUDADANO',
};

// Etiquetas de roles
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrador',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.DIRECTOR]: 'Director',
  [ROLES.COORDINADOR]: 'Coordinador',
  [ROLES.EMPLEADO]: 'Empleado',
  [ROLES.CIUDADANO]: 'Ciudadano',
};

// Estados de proyectos
export const PROJECT_STATUS = {
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
};

// Etiquetas de estados de proyectos
export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: 'Planificación',
  [PROJECT_STATUS.IN_PROGRESS]: 'En Progreso',
  [PROJECT_STATUS.COMPLETED]: 'Completado',
  [PROJECT_STATUS.PAUSED]: 'Pausado',
  [PROJECT_STATUS.CANCELLED]: 'Cancelado',
};

// Prioridades
export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// Etiquetas de prioridades
export const PRIORITY_LABELS = {
  [PRIORITY.LOW]: 'Baja',
  [PRIORITY.MEDIUM]: 'Media',
  [PRIORITY.HIGH]: 'Alta',
  [PRIORITY.CRITICAL]: 'Crítica',
};

// API Base URL - URL base del backend sin /api (para componentes que construyen la URL completa)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API URL - URL completa con /api para el cliente api.js que usa esto como baseURL
// Los hooks modernos usan rutas relativas como /projects, /tax, etc.
export const API_URL = `${API_BASE_URL}/api`;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Tipos de reportes ciudadanos
export const REPORT_TYPES = {
  POTHOLE: 'POTHOLE',
  STREET_LIGHT: 'STREET_LIGHT',
  WATER_LEAK: 'WATER_LEAK',
  GARBAGE: 'GARBAGE',
  SEWAGE: 'SEWAGE',
  SIDEWALK: 'SIDEWALK',
  PARK: 'PARK',
  TRAFFIC_SIGN: 'TRAFFIC_SIGN',
  NOISE: 'NOISE',
  STRAY_ANIMAL: 'STRAY_ANIMAL',
  ILLEGAL_CONSTRUCTION: 'ILLEGAL_CONSTRUCTION',
  OTHER: 'OTHER',
};

// Etiquetas de tipos de reportes
export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.POTHOLE]: 'Bache en la vía',
  [REPORT_TYPES.STREET_LIGHT]: 'Alumbrado público',
  [REPORT_TYPES.WATER_LEAK]: 'Fuga de agua',
  [REPORT_TYPES.GARBAGE]: 'Recolección de basura',
  [REPORT_TYPES.SEWAGE]: 'Problema de alcantarillado',
  [REPORT_TYPES.SIDEWALK]: 'Acera dañada',
  [REPORT_TYPES.PARK]: 'Mantenimiento de parque',
  [REPORT_TYPES.TRAFFIC_SIGN]: 'Señalización vial',
  [REPORT_TYPES.NOISE]: 'Contaminación sonora',
  [REPORT_TYPES.STRAY_ANIMAL]: 'Animal callejero',
  [REPORT_TYPES.ILLEGAL_CONSTRUCTION]: 'Construcción ilegal',
  [REPORT_TYPES.OTHER]: 'Otro',
};

// Estados de reportes ciudadanos
export const REPORT_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
};

// Etiquetas de estados de reportes
export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: 'Pendiente',
  [REPORT_STATUS.IN_REVIEW]: 'En revisión',
  [REPORT_STATUS.ASSIGNED]: 'Asignado',
  [REPORT_STATUS.IN_PROGRESS]: 'En progreso',
  [REPORT_STATUS.RESOLVED]: 'Resuelto',
  [REPORT_STATUS.CLOSED]: 'Cerrado',
  [REPORT_STATUS.REJECTED]: 'Rechazado',
};

// Colores de estados de reportes
export const REPORT_STATUS_COLORS = {
  [REPORT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [REPORT_STATUS.IN_REVIEW]: 'bg-blue-100 text-blue-800',
  [REPORT_STATUS.ASSIGNED]: 'bg-purple-100 text-purple-800',
  [REPORT_STATUS.IN_PROGRESS]: 'bg-orange-100 text-orange-800',
  [REPORT_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
  [REPORT_STATUS.CLOSED]: 'bg-gray-100 text-gray-800',
  [REPORT_STATUS.REJECTED]: 'bg-red-100 text-red-800',
};

// Estados de presupuesto participativo
export const BUDGET_STATUS = {
  DRAFT: 'DRAFT',
  OPEN_PROPOSALS: 'OPEN_PROPOSALS',
  EVALUATION: 'EVALUATION',
  VOTING: 'VOTING',
  CLOSED: 'CLOSED',
};

// Etiquetas de estados de presupuesto participativo
export const BUDGET_STATUS_LABELS = {
  [BUDGET_STATUS.DRAFT]: 'Borrador',
  [BUDGET_STATUS.OPEN_PROPOSALS]: 'Recibiendo propuestas',
  [BUDGET_STATUS.EVALUATION]: 'En evaluación',
  [BUDGET_STATUS.VOTING]: 'Votación abierta',
  [BUDGET_STATUS.CLOSED]: 'Cerrado',
};

// Estados de propuestas
export const PROPOSAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WINNER: 'WINNER',
};

// Etiquetas de estados de propuestas
export const PROPOSAL_STATUS_LABELS = {
  [PROPOSAL_STATUS.PENDING]: 'Pendiente',
  [PROPOSAL_STATUS.APPROVED]: 'Aprobada',
  [PROPOSAL_STATUS.REJECTED]: 'Rechazada',
  [PROPOSAL_STATUS.WINNER]: 'Ganadora',
};

// Categorías de documentos de transparencia
export const TRANSPARENCY_CATEGORIES = {
  BUDGET: 'BUDGET',
  PAYROLL: 'PAYROLL',
  CONTRACTS: 'CONTRACTS',
  ORDINANCES: 'ORDINANCES',
  MINUTES: 'MINUTES',
  ASSETS: 'ASSETS',
  REPORTS: 'REPORTS',
  OTHER: 'OTHER',
};

// Etiquetas de categorías de transparencia
export const TRANSPARENCY_CATEGORY_LABELS = {
  [TRANSPARENCY_CATEGORIES.BUDGET]: 'Presupuesto',
  [TRANSPARENCY_CATEGORIES.PAYROLL]: 'Nómina',
  [TRANSPARENCY_CATEGORIES.CONTRACTS]: 'Contrataciones',
  [TRANSPARENCY_CATEGORIES.ORDINANCES]: 'Ordenanzas',
  [TRANSPARENCY_CATEGORIES.MINUTES]: 'Actas',
  [TRANSPARENCY_CATEGORIES.ASSETS]: 'Bienes',
  [TRANSPARENCY_CATEGORIES.REPORTS]: 'Informes',
  [TRANSPARENCY_CATEGORIES.OTHER]: 'Otros',
};
