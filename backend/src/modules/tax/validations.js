/**
 * Validaciones para el módulo tributario
 * Utiliza Zod para validar los datos de entrada
 */

import { z } from 'zod';

// ============================================
// VALIDACIONES PARA CONTRIBUYENTES
// ============================================

// Base schema sin refine para poder usar .partial()
const taxpayerBaseSchema = z.object({
  taxId: z.string().min(5, 'El RIF/CI debe tener al menos 5 caracteres'),
  taxpayerType: z.enum(['NATURAL', 'LEGAL'], {
    errorMap: () => ({ message: 'Tipo de contribuyente inválido' }),
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  tradeName: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  parish: z.string().optional(),
  sector: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  notes: z.string().optional(),
});

// Schema completo con validación para creación
const taxpayerSchema = taxpayerBaseSchema.refine(
  (data) => {
    // Si es persona natural, requiere firstName y lastName
    if (data.taxpayerType === 'NATURAL') {
      return data.firstName && data.lastName;
    }
    // Si es persona jurídica, requiere businessName
    if (data.taxpayerType === 'LEGAL') {
      return data.businessName;
    }
    return true;
  },
  {
    message: 'Persona natural requiere nombre y apellido. Persona jurídica requiere razón social.',
    path: ['taxpayerType'],
  }
);

// Schema para actualización (sin validación estricta)
const updateTaxpayerSchema = taxpayerBaseSchema.partial();

// ============================================
// VALIDACIONES PARA NEGOCIOS
// ============================================

const businessSchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  licenseNumber: z.string().min(1, 'Número de licencia requerido'),
  businessName: z.string().min(1, 'Nombre del negocio requerido'),
  tradeName: z.string().optional(),
  activityCode: z.string().min(1, 'Código de actividad requerido'),
  activityName: z.string().min(1, 'Descripción de actividad requerida'),
  category: z.string().min(1, 'Categoría requerida'),
  address: z.string().min(1, 'Dirección requerida'),
  parish: z.string().min(1, 'Parroquia requerida'),
  sector: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  annualIncome: z.number().nonnegative('Ingresos no pueden ser negativos').optional(),
  taxRate: z.number().nonnegative('Alícuota no puede ser negativa'),
  openingDate: z.string().or(z.date()),
  licenseDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED']).optional(),
  employees: z.number().int().nonnegative().optional(),
  area: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

const updateBusinessSchema = businessSchema.partial().omit({ taxpayerId: true });

// ============================================
// VALIDACIONES PARA INMUEBLES
// ============================================

const propertySchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  cadastralCode: z.string().min(1, 'Código catastral requerido'),
  address: z.string().min(1, 'Dirección requerida'),
  parish: z.string().min(1, 'Parroquia requerida'),
  sector: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  landArea: z.number().positive('Área de terreno debe ser positiva'),
  buildingArea: z.number().nonnegative('Área de construcción no puede ser negativa').optional(),
  floors: z.number().int().positive().optional(),
  rooms: z.number().int().positive().optional(),
  propertyUse: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED', 'VACANT']),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'BUILDING', 'LAND', 'WAREHOUSE', 'OFFICE', 'LOCAL']),
  landValue: z.number().nonnegative('Valor del terreno no puede ser negativo'),
  buildingValue: z.number().nonnegative('Valor de construcción no puede ser negativo'),
  totalValue: z.number().nonnegative('Valor total no puede ser negativo'),
  taxRate: z.number().nonnegative('Alícuota no puede ser negativa'),
  constructionYear: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  isExempt: z.boolean().optional(),
  exemptionReason: z.string().optional(),
  exemptionExpiry: z.string().or(z.date()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
});

const updatePropertySchema = propertySchema.partial().omit({ taxpayerId: true });

// ============================================
// VALIDACIONES PARA VEHÍCULOS
// ============================================

const vehicleSchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  plate: z.string().min(1, 'Placa requerida'),
  serialNumber: z.string().optional(),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1, 'Año inválido'),
  color: z.string().optional(),
  vehicleType: z.enum(['CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'VAN', 'OTHER']),
  assessedValue: z.number().nonnegative('Valor fiscal no puede ser negativo'),
  taxRate: z.number().nonnegative('Alícuota no puede ser negativa'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD']).optional(),
  notes: z.string().optional(),
});

const updateVehicleSchema = vehicleSchema.partial().omit({ taxpayerId: true });

// ============================================
// VALIDACIONES PARA FACTURAS TRIBUTARIAS
// ============================================

const taxBillSchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  taxType: z.enum([
    'BUSINESS_TAX',
    'PROPERTY_TAX',
    'VEHICLE_TAX',
    'URBAN_CLEANING',
    'ADMINISTRATIVE',
    'SPACE_USE',
    'CEMETERY',
    'PUBLIC_EVENTS',
    'OTHER',
  ]),
  businessId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  fiscalYear: z.number().int().min(2000).max(2100),
  fiscalPeriod: z.string().optional(),
  baseAmount: z.number().nonnegative('Monto base no puede ser negativo'),
  taxRate: z.number().nonnegative('Alícuota no puede ser negativa'),
  taxAmount: z.number().nonnegative('Monto del impuesto no puede ser negativo'),
  surcharges: z.number().nonnegative('Recargos no pueden ser negativos').optional(),
  discounts: z.number().nonnegative('Descuentos no pueden ser negativos').optional(),
  totalAmount: z.number().nonnegative('Total no puede ser negativo'),
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  concept: z.string().min(1, 'Concepto requerido'),
  notes: z.string().optional(),
});

const updateTaxBillSchema = taxBillSchema.partial().omit({ taxpayerId: true });

// ============================================
// VALIDACIONES PARA PAGOS
// ============================================

const taxPaymentSchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  taxBillId: z.string().uuid('ID de factura inválido').optional(),
  amount: z.number().positive('Monto debe ser positivo'),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'MOBILE_PAYMENT', 'POS', 'CHECK', 'ONLINE']),
  paymentDate: z.string().or(z.date()),
  bankName: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// VALIDACIONES PARA SOLVENCIAS
// ============================================

const solvencySchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  solvencyType: z.enum(['GENERAL', 'BUSINESS', 'PROPERTY', 'VEHICLE']),
  issueDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()),
  notes: z.string().optional(),
});

// ============================================
// VALIDACIONES PARA INSPECCIONES
// ============================================

const inspectionSchema = z.object({
  businessId: z.string().uuid('ID de negocio inválido'),
  inspectionDate: z.string().or(z.date()),
  inspectionType: z.enum(['ROUTINE', 'COMPLAINT', 'RENEWAL', 'FOLLOW_UP']),
  inspectorId: z.string().uuid('ID de inspector inválido'),
  inspectorName: z.string().min(1, 'Nombre del inspector requerido'),
  findings: z.string().optional(),
  violations: z.string().optional(),
  recommendations: z.string().optional(),
  hasFine: z.boolean().optional(),
  fineAmount: z.number().nonnegative('Monto de multa no puede ser negativo').optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

const updateInspectionSchema = inspectionSchema.partial().omit({ businessId: true });

// ============================================
// VALIDACIONES PARA COBRANZA
// ============================================

const debtCollectionSchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  totalDebt: z.number().nonnegative('Deuda total no puede ser negativa'),
  oldestDebtDate: z.string().or(z.date()),
  debtAge: z.number().int().nonnegative('Antigüedad no puede ser negativa'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  stage: z.enum(['REMINDER', 'NOTICE', 'FORMAL', 'LEGAL']),
  assignedTo: z.string().uuid().optional(),
  hasPaymentPlan: z.boolean().optional(),
  paymentPlanDate: z.string().or(z.date()).optional(),
  installments: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

const updateDebtCollectionSchema = debtCollectionSchema.partial().omit({ taxpayerId: true });

const collectionActionSchema = z.object({
  debtCollectionId: z.string().uuid('ID de cobranza inválido'),
  actionType: z.enum([
    'PHONE_CALL',
    'EMAIL',
    'SMS',
    'LETTER',
    'VISIT',
    'LEGAL_NOTICE',
    'PAYMENT_PLAN',
    'OTHER',
  ]),
  actionDate: z.string().or(z.date()),
  description: z.string().min(1, 'Descripción requerida'),
  performedBy: z.string().uuid('ID de usuario inválido'),
  result: z.string().optional(),
  nextActionDate: z.string().or(z.date()).optional(),
});

export {
  taxpayerSchema,
  updateTaxpayerSchema,
  businessSchema,
  updateBusinessSchema,
  propertySchema,
  updatePropertySchema,
  vehicleSchema,
  updateVehicleSchema,
  taxBillSchema,
  updateTaxBillSchema,
  taxPaymentSchema,
  solvencySchema,
  inspectionSchema,
  updateInspectionSchema,
  debtCollectionSchema,
  updateDebtCollectionSchema,
  collectionActionSchema,
};
