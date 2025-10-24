/**
 * Servicio de Notificaciones Tributarias
 * Gestiona el envío de notificaciones automáticas para el módulo tributario
 */

import emailService from '../../../shared/services/email.service.js';
import {
  friendlyReminderTemplate,
  overdueNoticeTemplate,
  formalIntimationTemplate,
  paymentConfirmationTemplate,
  solvencyIssuedTemplate,
  paymentPlanApprovedTemplate,
  licenseRenewalReminderTemplate,
} from '../templates/email-templates.js';
import prisma from '../../../config/database.js';

class TaxNotificationService {
  /**
   * Envía recordatorio amigable antes del vencimiento
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Array} bills - Facturas próximas a vencer
   * @param {number} daysUntilDue - Días hasta el vencimiento
   */
  async sendFriendlyReminder(taxpayerId, bills, daysUntilDue = 7) {
    try {
      const taxpayer = await prisma.taxpayer.findUnique({
        where: { id: taxpayerId },
      });

      if (!taxpayer || !taxpayer.email) {
        console.log(`No email found for taxpayer ${taxpayerId}`);
        return { success: false, reason: 'no_email' };
      }

      const taxpayerName = taxpayer.firstName
        ? `${taxpayer.firstName} ${taxpayer.lastName}`
        : taxpayer.businessName;

      const emailHtml = friendlyReminderTemplate({
        taxpayerName,
        taxId: taxpayer.taxId,
        bills,
        daysUntilDue,
      });

      await emailService.sendEmail({
        to: taxpayer.email,
        subject: `Recordatorio: Facturas próximas a vencer (${daysUntilDue} días)`,
        html: emailHtml,
      });

      console.log(`✅ Friendly reminder sent to ${taxpayer.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending friendly reminder:', error);
      throw error;
    }
  }

  /**
   * Envía aviso de mora
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Array} bills - Facturas vencidas
   * @param {number} daysOverdue - Días de mora
   */
  async sendOverdueNotice(taxpayerId, bills, daysOverdue) {
    try {
      const taxpayer = await prisma.taxpayer.findUnique({
        where: { id: taxpayerId },
      });

      if (!taxpayer || !taxpayer.email) {
        return { success: false, reason: 'no_email' };
      }

      const taxpayerName = taxpayer.firstName
        ? `${taxpayer.firstName} ${taxpayer.lastName}`
        : taxpayer.businessName;

      const emailHtml = overdueNoticeTemplate({
        taxpayerName,
        taxId: taxpayer.taxId,
        bills,
        daysOverdue,
      });

      await emailService.sendEmail({
        to: taxpayer.email,
        subject: `⚠️ Aviso de Mora - ${daysOverdue} días de atraso`,
        html: emailHtml,
      });

      console.log(`✅ Overdue notice sent to ${taxpayer.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending overdue notice:', error);
      throw error;
    }
  }

  /**
   * Envía intimación formal
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Array} bills - Facturas vencidas
   * @param {number} daysOverdue - Días de mora
   * @param {string} caseNumber - Número de caso de cobranza
   */
  async sendFormalIntimation(taxpayerId, bills, daysOverdue, caseNumber) {
    try {
      const taxpayer = await prisma.taxpayer.findUnique({
        where: { id: taxpayerId },
      });

      if (!taxpayer || !taxpayer.email) {
        return { success: false, reason: 'no_email' };
      }

      const taxpayerName = taxpayer.firstName
        ? `${taxpayer.firstName} ${taxpayer.lastName}`
        : taxpayer.businessName;

      const emailHtml = formalIntimationTemplate({
        taxpayerName,
        taxId: taxpayer.taxId,
        bills,
        daysOverdue,
        caseNumber,
      });

      await emailService.sendEmail({
        to: taxpayer.email,
        subject: `🚨 INTIMACIÓN FORMAL DE PAGO - Caso ${caseNumber}`,
        html: emailHtml,
      });

      console.log(`✅ Formal intimation sent to ${taxpayer.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending formal intimation:', error);
      throw error;
    }
  }

  /**
   * Envía confirmación de pago
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Object} payment - Datos del pago
   * @param {Object} bill - Factura pagada (opcional)
   */
  async sendPaymentConfirmation(taxpayerId, payment, bill = null) {
    try {
      const taxpayer = await prisma.taxpayer.findUnique({
        where: { id: taxpayerId },
      });

      if (!taxpayer || !taxpayer.email) {
        return { success: false, reason: 'no_email' };
      }

      const taxpayerName = taxpayer.firstName
        ? `${taxpayer.firstName} ${taxpayer.lastName}`
        : taxpayer.businessName;

      const emailHtml = paymentConfirmationTemplate({
        taxpayerName,
        taxId: taxpayer.taxId,
        payment,
        bill,
      });

      await emailService.sendEmail({
        to: taxpayer.email,
        subject: `✓ Confirmación de Pago - Recibo ${payment.receiptNumber}`,
        html: emailHtml,
      });

      console.log(`✅ Payment confirmation sent to ${taxpayer.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw error;
    }
  }

  /**
   * Envía notificación de solvencia emitida
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Object} solvency - Datos de la solvencia
   */
  async sendSolvencyIssued(taxpayerId, solvency) {
    try {
      const taxpayer = await prisma.taxpayer.findUnique({
        where: { id: taxpayerId },
      });

      if (!taxpayer || !taxpayer.email) {
        return { success: false, reason: 'no_email' };
      }

      const taxpayerName = taxpayer.firstName
        ? `${taxpayer.firstName} ${taxpayer.lastName}`
        : taxpayer.businessName;

      const emailHtml = solvencyIssuedTemplate({
        taxpayerName,
        taxId: taxpayer.taxId,
        solvency,
      });

      await emailService.sendEmail({
        to: taxpayer.email,
        subject: `✓ Solvencia Municipal Emitida - ${solvency.solvencyNumber}`,
        html: emailHtml,
      });

      console.log(`✅ Solvency notification sent to ${taxpayer.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending solvency notification:', error);
      throw error;
    }
  }

  /**
   * Envía notificación de convenio de pago aprobado
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Object} paymentPlanData - Datos del convenio
   */
  async sendPaymentPlanApproved(taxpayerId, paymentPlanData) {
    try {
      const taxpayer = await prisma.taxpayer.findUnique({
        where: { id: taxpayerId },
      });

      if (!taxpayer || !taxpayer.email) {
        return { success: false, reason: 'no_email' };
      }

      const taxpayerName = taxpayer.firstName
        ? `${taxpayer.firstName} ${taxpayer.lastName}`
        : taxpayer.businessName;

      const emailHtml = paymentPlanApprovedTemplate({
        taxpayerName,
        taxId: taxpayer.taxId,
        ...paymentPlanData,
      });

      await emailService.sendEmail({
        to: taxpayer.email,
        subject: `✓ Convenio de Pago Aprobado`,
        html: emailHtml,
      });

      console.log(`✅ Payment plan notification sent to ${taxpayer.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending payment plan notification:', error);
      throw error;
    }
  }

  /**
   * Envía recordatorio de renovación de licencia
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Object} business - Datos del negocio
   * @param {number} daysUntilExpiry - Días hasta el vencimiento
   */
  async sendLicenseRenewalReminder(taxpayerId, business, daysUntilExpiry) {
    try {
      const taxpayer = await prisma.taxpayer.findUnique({
        where: { id: taxpayerId },
      });

      if (!taxpayer || !taxpayer.email) {
        return { success: false, reason: 'no_email' };
      }

      const taxpayerName = taxpayer.firstName
        ? `${taxpayer.firstName} ${taxpayer.lastName}`
        : taxpayer.businessName;

      const emailHtml = licenseRenewalReminderTemplate({
        taxpayerName,
        taxId: taxpayer.taxId,
        business,
        daysUntilExpiry,
      });

      await emailService.sendEmail({
        to: taxpayer.email,
        subject: `Renovación de Licencia - ${business.businessName} (${daysUntilExpiry} días)`,
        html: emailHtml,
      });

      console.log(`✅ License renewal reminder sent to ${taxpayer.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending license renewal reminder:', error);
      throw error;
    }
  }

  /**
   * Proceso automático: Envía recordatorios a facturas próximas a vencer
   * @param {number} daysBeforeDue - Días antes del vencimiento (default: 7)
   */
  async sendBulkFriendlyReminders(daysBeforeDue = 7) {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysBeforeDue);

      // Buscar facturas pendientes que vencen en X días
      const bills = await prisma.taxBill.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lte: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          taxpayer: true,
        },
      });

      // Agrupar por contribuyente
      const billsByTaxpayer = bills.reduce((acc, bill) => {
        if (!acc[bill.taxpayerId]) {
          acc[bill.taxpayerId] = [];
        }
        acc[bill.taxpayerId].push(bill);
        return acc;
      }, {});

      let sent = 0;
      let failed = 0;

      for (const [taxpayerId, taxpayerBills] of Object.entries(billsByTaxpayer)) {
        try {
          await this.sendFriendlyReminder(taxpayerId, taxpayerBills, daysBeforeDue);
          sent++;
        } catch (error) {
          console.error(`Failed to send reminder to taxpayer ${taxpayerId}:`, error);
          failed++;
        }
      }

      console.log(`📧 Bulk friendly reminders: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (error) {
      console.error('Error in bulk friendly reminders:', error);
      throw error;
    }
  }

  /**
   * Proceso automático: Envía avisos de mora
   * @param {number} daysOverdue - Días de mora (default: 15)
   */
  async sendBulkOverdueNotices(daysOverdue = 15) {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysOverdue);

      const bills = await prisma.taxBill.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lte: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          taxpayer: true,
        },
      });

      const billsByTaxpayer = bills.reduce((acc, bill) => {
        if (!acc[bill.taxpayerId]) {
          acc[bill.taxpayerId] = [];
        }
        acc[bill.taxpayerId].push(bill);
        return acc;
      }, {});

      let sent = 0;
      let failed = 0;

      for (const [taxpayerId, taxpayerBills] of Object.entries(billsByTaxpayer)) {
        try {
          await this.sendOverdueNotice(taxpayerId, taxpayerBills, daysOverdue);
          sent++;
        } catch (error) {
          console.error(`Failed to send overdue notice to taxpayer ${taxpayerId}:`, error);
          failed++;
        }
      }

      console.log(`📧 Bulk overdue notices: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (error) {
      console.error('Error in bulk overdue notices:', error);
      throw error;
    }
  }

  /**
   * Proceso automático: Envía recordatorios de renovación de licencias
   * @param {number} daysBeforeExpiry - Días antes del vencimiento (default: 30)
   */
  async sendBulkLicenseRenewalReminders(daysBeforeExpiry = 30) {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);

      const businesses = await prisma.business.findMany({
        where: {
          status: 'ACTIVE',
          expiryDate: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lte: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          taxpayer: true,
        },
      });

      let sent = 0;
      let failed = 0;

      for (const business of businesses) {
        try {
          await this.sendLicenseRenewalReminder(
            business.taxpayerId,
            business,
            daysBeforeExpiry
          );
          sent++;
        } catch (error) {
          console.error(`Failed to send renewal reminder for business ${business.id}:`, error);
          failed++;
        }
      }

      console.log(`📧 Bulk license renewal reminders: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (error) {
      console.error('Error in bulk license renewal reminders:', error);
      throw error;
    }
  }
}

export default new TaxNotificationService();
