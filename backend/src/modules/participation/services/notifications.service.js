/**
 * Servicio para gestión de Notificaciones de Reportes
 */

import prisma from '../../../config/database.js';

/**
 * Plantillas de mensajes de notificación
 */
const messageTemplates = {
  REPORT_RECEIVED: {
    subject: 'Reporte Recibido - {ticketNumber}',
    message: `Estimado/a {reporterName},

Hemos recibido su reporte con el número de ticket: {ticketNumber}

Tipo: {type}
Ubicación: {location}

Su reporte está siendo procesado y será asignado al departamento correspondiente. Le mantendremos informado sobre el progreso.

Puede consultar el estado de su reporte en cualquier momento usando el número de ticket.

Gracias por ayudarnos a mejorar nuestra ciudad.

Alcaldía Municipal`
  },
  REPORT_ASSIGNED: {
    subject: 'Reporte Asignado - {ticketNumber}',
    message: `Estimado/a {reporterName},

Su reporte {ticketNumber} ha sido asignado al departamento correspondiente para su atención.

Estado: Asignado
Prioridad: {priority}

Estamos trabajando para resolver su solicitud en el menor tiempo posible.

Alcaldía Municipal`
  },
  REPORT_IN_PROGRESS: {
    subject: 'Reporte En Proceso - {ticketNumber}',
    message: `Estimado/a {reporterName},

Su reporte {ticketNumber} está siendo atendido por nuestro equipo.

Estado: En Proceso

Le notificaremos cuando el problema haya sido resuelto.

Alcaldía Municipal`
  },
  REPORT_RESOLVED: {
    subject: 'Reporte Resuelto - {ticketNumber}',
    message: `Estimado/a {reporterName},

Su reporte {ticketNumber} ha sido resuelto.

{resolutionNotes}

Por favor, califique nuestro servicio para ayudarnos a mejorar.

Gracias por su colaboración.

Alcaldía Municipal`
  },
  REPORT_CLOSED: {
    subject: 'Reporte Cerrado - {ticketNumber}',
    message: `Estimado/a {reporterName},

Su reporte {ticketNumber} ha sido cerrado.

Gracias por utilizar nuestro sistema de reportes ciudadanos.

Alcaldía Municipal`
  },
  REPORT_REOPENED: {
    subject: 'Reporte Reabierto - {ticketNumber}',
    message: `Estimado/a {reporterName},

Su reporte {ticketNumber} ha sido reabierto para revisión adicional.

Estamos trabajando para resolver el problema.

Alcaldía Municipal`
  },
  REPORT_COMMENT: {
    subject: 'Nuevo Comentario - {ticketNumber}',
    message: `Estimado/a {reporterName},

Hay un nuevo comentario en su reporte {ticketNumber}:

{comment}

Alcaldía Municipal`
  }
};

/**
 * Reemplaza variables en plantilla
 * @param {string} template - Plantilla con variables
 * @param {Object} data - Datos para reemplazar
 * @returns {string} Texto con variables reemplazadas
 */
function replaceVariables(template, data) {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });
  return result;
}

/**
 * Crea una notificación para un reporte
 * @param {string} reportId - ID del reporte
 * @param {string} notificationType - Tipo de notificación
 * @param {Object} additionalData - Datos adicionales
 * @returns {Promise<Object>} Notificación creada
 */
export async function createNotification(reportId, notificationType, additionalData = {}) {
  // Obtener datos del reporte
  const report = await prisma.citizenReport.findUnique({
    where: { id: reportId }
  });
  
  if (!report) {
    throw new Error('Reporte no encontrado');
  }
  
  // Si no hay email, no crear notificación
  if (!report.reporterEmail) {
    return null;
  }
  
  // Obtener plantilla
  const template = messageTemplates[notificationType];
  if (!template) {
    throw new Error(`Tipo de notificación inválido: ${notificationType}`);
  }
  
  // Preparar datos para reemplazar en plantilla
  const templateData = {
    ticketNumber: report.ticketNumber,
    reporterName: report.reporterName || 'Ciudadano',
    type: report.type,
    location: report.location,
    priority: report.priority,
    resolutionNotes: report.resolutionNotes || '',
    ...additionalData
  };
  
  // Generar mensaje
  const subject = replaceVariables(template.subject, templateData);
  const message = replaceVariables(template.message, templateData);
  
  // Crear notificación en BD
  const notification = await prisma.reportNotification.create({
    data: {
      reportId,
      type: notificationType,
      channel: 'EMAIL',
      recipient: report.reporterEmail,
      subject,
      message,
      status: 'PENDING'
    }
  });
  
  // TODO: Aquí se integraría con servicio de email real (SendGrid, AWS SES, etc.)
  // Por ahora solo registramos en BD
  
  return notification;
}

/**
 * Envía notificación cuando cambia el estado del reporte
 * @param {string} reportId - ID del reporte
 * @param {string} newStatus - Nuevo estado
 * @returns {Promise<Object|null>} Notificación enviada
 */
export async function notifyStatusChange(reportId, newStatus) {
  const notificationTypeMap = {
    RECEIVED: 'REPORT_RECEIVED',
    ASSIGNED: 'REPORT_ASSIGNED',
    IN_PROGRESS: 'REPORT_IN_PROGRESS',
    RESOLVED: 'REPORT_RESOLVED',
    CLOSED: 'REPORT_CLOSED',
    REOPENED: 'REPORT_REOPENED'
  };
  
  const notificationType = notificationTypeMap[newStatus];
  if (!notificationType) {
    return null;
  }
  
  return await createNotification(reportId, notificationType);
}

/**
 * Envía notificación de nuevo comentario
 * @param {string} reportId - ID del reporte
 * @param {string} comment - Comentario
 * @returns {Promise<Object|null>} Notificación enviada
 */
export async function notifyNewComment(reportId, comment) {
  return await createNotification(reportId, 'REPORT_COMMENT', { comment });
}

/**
 * Obtiene notificaciones de un reporte
 * @param {string} reportId - ID del reporte
 * @returns {Promise<Array>} Lista de notificaciones
 */
export async function getReportNotifications(reportId) {
  return await prisma.reportNotification.findMany({
    where: { reportId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Marca notificación como enviada
 * @param {string} notificationId - ID de la notificación
 * @returns {Promise<Object>} Notificación actualizada
 */
export async function markAsSent(notificationId) {
  return await prisma.reportNotification.update({
    where: { id: notificationId },
    data: {
      status: 'SENT',
      sentAt: new Date()
    }
  });
}

/**
 * Marca notificación como fallida
 * @param {string} notificationId - ID de la notificación
 * @param {string} error - Mensaje de error
 * @returns {Promise<Object>} Notificación actualizada
 */
export async function markAsFailed(notificationId, error) {
  return await prisma.reportNotification.update({
    where: { id: notificationId },
    data: {
      status: 'FAILED',
      error
    }
  });
}

/**
 * Procesa notificaciones pendientes (para job/cron)
 * @returns {Promise<Object>} Resultado del procesamiento
 */
export async function processPendingNotifications() {
  const pendingNotifications = await prisma.reportNotification.findMany({
    where: {
      status: 'PENDING'
    },
    take: 50 // Procesar en lotes
  });
  
  const results = {
    processed: 0,
    sent: 0,
    failed: 0
  };
  
  for (const notification of pendingNotifications) {
    results.processed++;
    
    try {
      // TODO: Aquí se enviaría el email real
      // await emailService.send(notification.recipient, notification.subject, notification.message);
      
      await markAsSent(notification.id);
      results.sent++;
    } catch (error) {
      await markAsFailed(notification.id, error.message);
      results.failed++;
    }
  }
  
  return results;
}
