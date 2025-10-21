/**
 * Controlador de Vehículos
 * Maneja las peticiones HTTP para el módulo de vehículos
 */

import * as vehicleService from '../services/vehicle.service.js';
import { vehicleSchema, updateVehicleSchema } from '../validations.js';

/**
 * Obtener todos los vehículos
 * GET /api/tax/vehicles
 */
async function getAllVehicles(req, res) {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    
    const result = await vehicleService.getAllVehicles(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      message: 'Vehículos obtenidos exitosamente',
      ...result,
    });
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos',
      error: error.message,
    });
  }
}

/**
 * Obtener un vehículo por ID
 * GET /api/tax/vehicles/:id
 */
async function getVehicleById(req, res) {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id);
    
    res.json({
      success: true,
      message: 'Vehículo obtenido exitosamente',
      data: vehicle,
    });
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    const statusCode = error.message === 'Vehículo no encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Crear un nuevo vehículo
 * POST /api/tax/vehicles
 */
async function createVehicle(req, res) {
  try {
    const validatedData = vehicleSchema.parse(req.body);
    const vehicle = await vehicleService.createVehicle(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Vehículo creado exitosamente',
      data: vehicle,
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    
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
      message: 'Error al crear vehículo',
      error: error.message,
    });
  }
}

/**
 * Actualizar un vehículo
 * PUT /api/tax/vehicles/:id
 */
async function updateVehicle(req, res) {
  try {
    const { id } = req.params;
    const validatedData = updateVehicleSchema.parse(req.body);
    const vehicle = await vehicleService.updateVehicle(id, validatedData);
    
    res.json({
      success: true,
      message: 'Vehículo actualizado exitosamente',
      data: vehicle,
    });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
      });
    }
    
    if (error.message === 'Vehículo no encontrado') {
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
      message: 'Error al actualizar vehículo',
      error: error.message,
    });
  }
}

/**
 * Eliminar un vehículo
 * DELETE /api/tax/vehicles/:id
 */
async function deleteVehicle(req, res) {
  try {
    const { id } = req.params;
    await vehicleService.deleteVehicle(id);
    
    res.json({
      success: true,
      message: 'Vehículo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    
    if (error.message === 'Vehículo no encontrado') {
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
      message: 'Error al eliminar vehículo',
      error: error.message,
    });
  }
}

/**
 * Calcular impuesto sobre vehículos
 * POST /api/tax/vehicles/:id/calculate-tax
 */
async function calculateVehicleTax(req, res) {
  try {
    const { id } = req.params;
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        message: 'Año fiscal requerido',
      });
    }
    
    const calculation = await vehicleService.calculateVehicleTax(id, fiscalYear);
    
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
 * POST /api/tax/vehicles/:id/generate-bill
 */
async function generateVehicleTaxBill(req, res) {
  try {
    const { id } = req.params;
    const { fiscalYear } = req.body;
    
    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        message: 'Año fiscal requerido',
      });
    }
    
    const taxBill = await vehicleService.generateVehicleTaxBill(id, fiscalYear);
    
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
 * Transferir vehículo a otro contribuyente
 * POST /api/tax/vehicles/:id/transfer
 */
async function transferVehicle(req, res) {
  try {
    const { id } = req.params;
    const { newTaxpayerId } = req.body;
    
    if (!newTaxpayerId) {
      return res.status(400).json({
        success: false,
        message: 'ID del nuevo contribuyente requerido',
      });
    }
    
    const vehicle = await vehicleService.transferVehicle(id, newTaxpayerId);
    
    res.json({
      success: true,
      message: 'Vehículo transferido exitosamente',
      data: vehicle,
    });
  } catch (error) {
    console.error('Error al transferir vehículo:', error);
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.message.includes('deudas pendientes')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al transferir vehículo',
      error: error.message,
    });
  }
}

export {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  calculateVehicleTax,
  generateVehicleTaxBill,
  transferVehicle,
};
