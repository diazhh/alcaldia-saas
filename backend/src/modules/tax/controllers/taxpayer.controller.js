/**
 * Controlador de Contribuyentes
 * Maneja las peticiones HTTP para el módulo de contribuyentes
 */

import * as taxpayerService from '../services/taxpayer.service.js';
import { taxpayerSchema, updateTaxpayerSchema } from '../validations.js';

/**
 * Obtener todos los contribuyentes
 * GET /api/tax/taxpayers
 */
async function getAllTaxpayers(req, res) {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    
    const result = await taxpayerService.getAllTaxpayers(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      message: 'Contribuyentes obtenidos exitosamente',
      ...result,
    });
  } catch (error) {
    console.error('Error al obtener contribuyentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contribuyentes',
      error: error.message,
    });
  }
}

/**
 * Obtener un contribuyente por ID
 * GET /api/tax/taxpayers/:id
 */
async function getTaxpayerById(req, res) {
  try {
    const { id } = req.params;
    const taxpayer = await taxpayerService.getTaxpayerById(id);
    
    res.json({
      success: true,
      message: 'Contribuyente obtenido exitosamente',
      data: taxpayer,
    });
  } catch (error) {
    console.error('Error al obtener contribuyente:', error);
    const statusCode = error.message === 'Contribuyente no encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Obtener un contribuyente por RIF/CI
 * GET /api/tax/taxpayers/by-tax-id/:taxId
 */
async function getTaxpayerByTaxId(req, res) {
  try {
    const { taxId } = req.params;
    const taxpayer = await taxpayerService.getTaxpayerByTaxId(taxId);
    
    res.json({
      success: true,
      message: 'Contribuyente obtenido exitosamente',
      data: taxpayer,
    });
  } catch (error) {
    console.error('Error al obtener contribuyente:', error);
    const statusCode = error.message === 'Contribuyente no encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Crear un nuevo contribuyente
 * POST /api/tax/taxpayers
 */
async function createTaxpayer(req, res) {
  try {
    // Validar datos
    const validatedData = taxpayerSchema.parse(req.body);
    
    const taxpayer = await taxpayerService.createTaxpayer(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Contribuyente creado exitosamente',
      data: taxpayer,
    });
  } catch (error) {
    console.error('Error al crear contribuyente:', error);
    
    // Errores de validación de Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
      });
    }
    
    // Error de duplicado
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear contribuyente',
      error: error.message,
    });
  }
}

/**
 * Actualizar un contribuyente
 * PUT /api/tax/taxpayers/:id
 */
async function updateTaxpayer(req, res) {
  try {
    const { id } = req.params;
    
    // Validar datos
    const validatedData = updateTaxpayerSchema.parse(req.body);
    
    const taxpayer = await taxpayerService.updateTaxpayer(id, validatedData);
    
    res.json({
      success: true,
      message: 'Contribuyente actualizado exitosamente',
      data: taxpayer,
    });
  } catch (error) {
    console.error('Error al actualizar contribuyente:', error);
    
    // Errores de validación de Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
      });
    }
    
    // Error de no encontrado
    if (error.message === 'Contribuyente no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    // Error de duplicado
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contribuyente',
      error: error.message,
    });
  }
}

/**
 * Eliminar un contribuyente
 * DELETE /api/tax/taxpayers/:id
 */
async function deleteTaxpayer(req, res) {
  try {
    const { id } = req.params;
    await taxpayerService.deleteTaxpayer(id);
    
    res.json({
      success: true,
      message: 'Contribuyente eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar contribuyente:', error);
    
    if (error.message === 'Contribuyente no encontrado') {
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
      message: 'Error al eliminar contribuyente',
      error: error.message,
    });
  }
}

/**
 * Obtener estado de cuenta de un contribuyente
 * GET /api/tax/taxpayers/:id/account-status
 */
async function getTaxpayerAccountStatus(req, res) {
  try {
    const { id } = req.params;
    const accountStatus = await taxpayerService.getTaxpayerAccountStatus(id);
    
    res.json({
      success: true,
      message: 'Estado de cuenta obtenido exitosamente',
      data: accountStatus,
    });
  } catch (error) {
    console.error('Error al obtener estado de cuenta:', error);
    const statusCode = error.message === 'Contribuyente no encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Verificar si un contribuyente está solvente
 * GET /api/tax/taxpayers/:id/is-solvent
 */
async function checkTaxpayerSolvency(req, res) {
  try {
    const { id } = req.params;
    const isSolvent = await taxpayerService.isTaxpayerSolvent(id);
    
    res.json({
      success: true,
      message: 'Verificación de solvencia realizada',
      data: { isSolvent },
    });
  } catch (error) {
    console.error('Error al verificar solvencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar solvencia',
      error: error.message,
    });
  }
}

export {
  getAllTaxpayers,
  getTaxpayerById,
  getTaxpayerByTaxId,
  createTaxpayer,
  updateTaxpayer,
  deleteTaxpayer,
  getTaxpayerAccountStatus,
  checkTaxpayerSolvency,
};
