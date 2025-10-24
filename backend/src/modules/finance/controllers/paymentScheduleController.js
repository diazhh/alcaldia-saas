/**
 * Controlador de Programación de Pagos
 */

import * as paymentScheduleService from '../services/paymentSchedule.service.js';

/**
 * Crear programación de pago
 */
export async function createPaymentSchedule(req, res, next) {
  try {
    const schedule = await paymentScheduleService.createPaymentSchedule(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener programaciones
 */
export async function getPaymentSchedules(req, res, next) {
  try {
    const schedules = await paymentScheduleService.getPaymentSchedules(req.query);
    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener programación por ID
 */
export async function getPaymentScheduleById(req, res, next) {
  try {
    const schedule = await paymentScheduleService.getPaymentScheduleById(req.params.id);
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Aprobar programación
 */
export async function approvePaymentSchedule(req, res, next) {
  try {
    const schedule = await paymentScheduleService.approvePaymentSchedule(
      req.params.id,
      req.user.id
    );
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rechazar programación
 */
export async function rejectPaymentSchedule(req, res, next) {
  try {
    const { reason } = req.body;
    const schedule = await paymentScheduleService.rejectPaymentSchedule(req.params.id, reason);
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Procesar pago
 */
export async function processPaymentSchedule(req, res, next) {
  try {
    const result = await paymentScheduleService.processPaymentSchedule(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancelar programación
 */
export async function cancelPaymentSchedule(req, res, next) {
  try {
    const { reason } = req.body;
    const schedule = await paymentScheduleService.cancelPaymentSchedule(req.params.id, reason);
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar fecha programada
 */
export async function updateScheduledDate(req, res, next) {
  try {
    const { scheduledDate } = req.body;
    const schedule = await paymentScheduleService.updateScheduledDate(req.params.id, scheduledDate);
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas
 */
export async function getPaymentScheduleStats(req, res, next) {
  try {
    const stats = await paymentScheduleService.getPaymentScheduleStats(req.query);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener calendario de pagos
 */
export async function getPaymentCalendar(req, res, next) {
  try {
    const { year, month } = req.query;
    const calendar = await paymentScheduleService.getPaymentCalendar(
      parseInt(year),
      parseInt(month)
    );
    res.json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crear lote de pagos
 */
export async function createPaymentBatch(req, res, next) {
  try {
    const { scheduleIds, batchNumber } = req.body;
    const batch = await paymentScheduleService.createPaymentBatch(
      scheduleIds,
      batchNumber,
      req.user.id
    );
    res.status(201).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    next(error);
  }
}
