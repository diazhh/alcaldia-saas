/**
 * Controlador de Inmuebles
 * Maneja las peticiones HTTP para el módulo de inmuebles
 */

import * as propertyService from '../services/property.service.js';
import { propertySchema, updatePropertySchema } from '../validations.js';

/**
 * Obtener todos los inmuebles
 * GET /api/tax/properties
 */
async function getAllProperties(req, res) {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    
    const result = await propertyService.getAllProperties(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      message: 'Inmuebles obtenidos exitosamente',
      ...result,
    });
  } catch (error) {
    console.error('Error al obtener inmuebles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inmuebles',
      error: error.message,
    });
  }
}

/**
 * Obtener un inmueble por ID
 * GET /api/tax/properties/:id
 */
async function getPropertyById(req, res) {
  try {
    const { id } = req.params;
    const property = await propertyService.getPropertyById(id);
    
    res.json({
      success: true,
      message: 'Inmueble obtenido exitosamente',
      data: property,
    });
  } catch (error) {
    console.error('Error al obtener inmueble:', error);
    const statusCode = error.message === 'Inmueble no encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Crear un nuevo inmueble
 * POST /api/tax/properties
 */
async function createProperty(req, res) {
  try {
    const validatedData = propertySchema.parse(req.body);
    const property = await propertyService.createProperty(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Inmueble creado exitosamente',
      data: property,
    });
  } catch (error) {
    console.error('Error al crear inmueble:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
      });
    }
    
    if (error.message.includes('Ya existe') || error.message.includes('no encontrado')) {
      return res.status(error.message.includes('Ya existe') ? 409 : 404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear inmueble',
      error: error.message,
    });
  }
}

/**
 * Actualizar un inmueble
 * PUT /api/tax/properties/:id
 */
async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const validatedData = updatePropertySchema.parse(req.body);
    const property = await propertyService.updateProperty(id, validatedData);
    
    res.json({
      success: true,
      message: 'Inmueble actualizado exitosamente',
      data: property,
    });
  } catch (error) {
    console.error('Error al actualizar inmueble:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
      });
    }
    
    if (error.message === 'Inmueble no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar inmueble',
      error: error.message,
    });
  }
}

/**
 * Eliminar un inmueble
 * DELETE /api/tax/properties/:id
 */
async function deleteProperty(req, res) {
  try {
    const { id } = req.params;
    await propertyService.deleteProperty(id);
    
    res.json({
      success: true,
      message: 'Inmueble eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar inmueble:', error);
    
    if (error.message === 'Inmueble no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.message.includes('No se puede eliminar')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al eliminar inmueble',
      error: error.message,
    });
  }
}

/**
 * Calcular impuesto sobre inmuebles
 * POST /api/tax/properties/:id/calculate-tax
 */
async function calculatePropertyTax(req, res) {
  try {
    const { id } = req.params;
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        message: 'Año fiscal requerido',
      });
    }
    
    const calculation = await propertyService.calculatePropertyTax(id, fiscalYear);
    
    res.json({
      success: true,
      message: 'Impuesto calculado exitosamente',
      data: calculation,
    });
  } catch (error) {
    console.error('Error al calcular impuesto:', error);
    
    if (error.message.includes('no encontrado') || error.message.includes('no está activo')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al calcular impuesto',
      error: error.message,
    });
  }
}

/**
 * Generar factura de impuesto
 * POST /api/tax/properties/:id/generate-bill
 */
async function generatePropertyTaxBill(req, res) {
  try {
    const { id } = req.params;
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        message: 'Año fiscal requerido',
      });
    }
    
    const taxBill = await propertyService.generatePropertyTaxBill(id, fiscalYear);
    
    res.status(201).json({
      success: true,
      message: 'Factura generada exitosamente',
      data: taxBill,
    });
  } catch (error) {
    console.error('Error al generar factura:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.message.includes('Ya existe') || error.message.includes('exonerado')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al generar factura',
      error: error.message,
    });
  }
}

/**
 * Actualizar exoneración de inmueble
 * PUT /api/tax/properties/:id/exemption
 */
async function updatePropertyExemption(req, res) {
  try {
    const { id } = req.params;
    const { isExempt, exemptionReason, exemptionExpiry } = req.body;
    
    const property = await propertyService.updatePropertyExemption(id, {
      isExempt,
      exemptionReason,
      exemptionExpiry,
    });
    
    res.json({
      success: true,
      message: 'Exoneración actualizada exitosamente',
      data: property,
    });
  } catch (error) {
    console.error('Error al actualizar exoneración:', error);
    
    if (error.message === 'Inmueble no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar exoneración',
      error: error.message,
    });
  }
}

export {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  calculatePropertyTax,
  generatePropertyTaxBill,
  updatePropertyExemption,
};
