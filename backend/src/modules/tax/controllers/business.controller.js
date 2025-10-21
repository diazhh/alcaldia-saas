/**
 * Controlador de Negocios (Patentes Comerciales)
 * Maneja las peticiones HTTP para el módulo de negocios
 */

import * as businessService from '../services/business.service.js';
import { businessSchema, updateBusinessSchema } from '../validations.js';

/**
 * Obtener todos los negocios
 * GET /api/tax/businesses
 */
async function getAllBusinesses(req, res) {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    
    const result = await businessService.getAllBusinesses(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      message: 'Negocios obtenidos exitosamente',
      ...result,
    });
  } catch (error) {
    console.error('Error al obtener negocios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener negocios',
      error: error.message,
    });
  }
}

/**
 * Obtener un negocio por ID
 * GET /api/tax/businesses/:id
 */
async function getBusinessById(req, res) {
  try {
    const { id } = req.params;
    const business = await businessService.getBusinessById(id);
    
    res.json({
      success: true,
      message: 'Negocio obtenido exitosamente',
      data: business,
    });
  } catch (error) {
    console.error('Error al obtener negocio:', error);
    const statusCode = error.message === 'Negocio no encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Crear un nuevo negocio
 * POST /api/tax/businesses
 */
async function createBusiness(req, res) {
  try {
    const validatedData = businessSchema.parse(req.body);
    const business = await businessService.createBusiness(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Negocio creado exitosamente',
      data: business,
    });
  } catch (error) {
    console.error('Error al crear negocio:', error);
    
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
      message: 'Error al crear negocio',
      error: error.message,
    });
  }
}

/**
 * Actualizar un negocio
 * PUT /api/tax/businesses/:id
 */
async function updateBusiness(req, res) {
  try {
    const { id } = req.params;
    const validatedData = updateBusinessSchema.parse(req.body);
    const business = await businessService.updateBusiness(id, validatedData);
    
    res.json({
      success: true,
      message: 'Negocio actualizado exitosamente',
      data: business,
    });
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
      });
    }
    
    if (error.message === 'Negocio no encontrado') {
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
      message: 'Error al actualizar negocio',
      error: error.message,
    });
  }
}

/**
 * Eliminar un negocio
 * DELETE /api/tax/businesses/:id
 */
async function deleteBusiness(req, res) {
  try {
    const { id } = req.params;
    await businessService.deleteBusiness(id);
    
    res.json({
      success: true,
      message: 'Negocio eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar negocio:', error);
    
    if (error.message === 'Negocio no encontrado') {
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
      message: 'Error al eliminar negocio',
      error: error.message,
    });
  }
}

/**
 * Calcular impuesto de actividades económicas
 * POST /api/tax/businesses/:id/calculate-tax
 */
async function calculateBusinessTax(req, res) {
  try {
    const { id } = req.params;
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        message: 'Año fiscal requerido',
      });
    }
    
    const calculation = await businessService.calculateBusinessTax(id, fiscalYear);
    
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
 * POST /api/tax/businesses/:id/generate-bill
 */
async function generateBusinessTaxBill(req, res) {
  try {
    const { id } = req.params;
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        message: 'Año fiscal requerido',
      });
    }
    
    const taxBill = await businessService.generateBusinessTaxBill(id, fiscalYear);
    
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
    
    if (error.message.includes('Ya existe')) {
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
 * Renovar licencia de negocio
 * POST /api/tax/businesses/:id/renew-license
 */
async function renewBusinessLicense(req, res) {
  try {
    const { id } = req.params;
    const { expiryDate } = req.body;
    
    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de vencimiento requerida',
      });
    }
    
    const business = await businessService.renewBusinessLicense(id, new Date(expiryDate));
    
    res.json({
      success: true,
      message: 'Licencia renovada exitosamente',
      data: business,
    });
  } catch (error) {
    console.error('Error al renovar licencia:', error);
    
    if (error.message === 'Negocio no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al renovar licencia',
      error: error.message,
    });
  }
}

export {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  calculateBusinessTax,
  generateBusinessTaxBill,
  renewBusinessLicense,
};
