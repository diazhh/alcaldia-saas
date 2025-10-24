/**
 * Servicio de Auditoría
 * Registra todas las acciones importantes del sistema para trazabilidad
 */

import prisma from '../../config/database.js';

class AuditService {
  /**
   * Registra una acción de auditoría
   * @param {Object} params - Parámetros de auditoría
   * @param {string} params.userId - ID del usuario que realiza la acción
   * @param {string} params.action - Acción realizada (CREATE, UPDATE, DELETE, etc.)
   * @param {string} params.module - Módulo del sistema (TAX, FINANCE, etc.)
   * @param {string} params.entity - Entidad afectada (TaxBill, Payment, etc.)
   * @param {string} params.entityId - ID de la entidad
   * @param {Object} params.oldData - Datos anteriores (para UPDATE/DELETE)
   * @param {Object} params.newData - Datos nuevos (para CREATE/UPDATE)
   * @param {string} params.ipAddress - Dirección IP del usuario
   * @param {string} params.userAgent - User agent del navegador
   * @param {Object} params.metadata - Metadatos adicionales
   */
  async log({
    userId,
    action,
    module,
    entity,
    entityId,
    oldData = null,
    newData = null,
    ipAddress = null,
    userAgent = null,
    metadata = null,
  }) {
    try {
      // Por ahora, solo logueamos a consola y almacenamos en memoria
      // En producción, esto debería ir a una tabla de auditoría en la BD
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userId,
        action,
        module,
        entity,
        entityId,
        changes: this.calculateChanges(oldData, newData),
        ipAddress,
        userAgent,
        metadata,
      };

      // Log a consola con formato
      console.log('📋 [AUDIT]', JSON.stringify(auditEntry, null, 2));

      // TODO: Guardar en tabla de auditoría cuando se cree el modelo
      // await prisma.auditLog.create({ data: auditEntry });

      return auditEntry;
    } catch (error) {
      console.error('Error logging audit entry:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Calcula los cambios entre datos antiguos y nuevos
   * @param {Object} oldData - Datos anteriores
   * @param {Object} newData - Datos nuevos
   * @returns {Object} Objeto con los cambios
   */
  calculateChanges(oldData, newData) {
    if (!oldData || !newData) {
      return null;
    }

    const changes = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key],
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Middleware de Express para auditoría automática
   */
  middleware() {
    return (req, res, next) => {
      // Guardar el método original res.json
      const originalJson = res.json.bind(res);

      // Sobrescribir res.json para capturar la respuesta
      res.json = (data) => {
        // Solo auditar operaciones exitosas de modificación
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const method = req.method;
          const shouldAudit = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

          if (shouldAudit && req.user) {
            const action = this.getActionFromMethod(method);
            const { module, entity } = this.parseRoute(req.route?.path || req.path);

            this.log({
              userId: req.user.id,
              action,
              module,
              entity,
              entityId: req.params.id || data?.id,
              oldData: req.auditOldData,
              newData: data,
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
              metadata: {
                method: req.method,
                path: req.path,
                query: req.query,
              },
            });
          }
        }

        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Obtiene la acción según el método HTTP
   * @param {string} method - Método HTTP
   * @returns {string} Acción
   */
  getActionFromMethod(method) {
    const actions = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actions[method] || 'UNKNOWN';
  }

  /**
   * Parsea la ruta para extraer módulo y entidad
   * @param {string} path - Ruta de la API
   * @returns {Object} Módulo y entidad
   */
  parseRoute(path) {
    const parts = path.split('/').filter(Boolean);
    return {
      module: parts[1]?.toUpperCase() || 'UNKNOWN',
      entity: parts[2] || 'UNKNOWN',
    };
  }

  /**
   * Registra un login de usuario
   * @param {string} userId - ID del usuario
   * @param {boolean} success - Si el login fue exitoso
   * @param {string} ipAddress - IP del usuario
   */
  async logLogin(userId, success, ipAddress) {
    return this.log({
      userId,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      module: 'AUTH',
      entity: 'User',
      entityId: userId,
      ipAddress,
    });
  }

  /**
   * Registra un logout de usuario
   * @param {string} userId - ID del usuario
   * @param {string} ipAddress - IP del usuario
   */
  async logLogout(userId, ipAddress) {
    return this.log({
      userId,
      action: 'LOGOUT',
      module: 'AUTH',
      entity: 'User',
      entityId: userId,
      ipAddress,
    });
  }

  /**
   * Registra un pago tributario
   * @param {string} userId - ID del usuario que registra
   * @param {Object} payment - Datos del pago
   */
  async logTaxPayment(userId, payment) {
    return this.log({
      userId,
      action: 'PAYMENT_REGISTERED',
      module: 'TAX',
      entity: 'TaxPayment',
      entityId: payment.id,
      newData: payment,
      metadata: {
        amount: payment.amount,
        method: payment.paymentMethod,
        taxpayerId: payment.taxpayerId,
      },
    });
  }

  /**
   * Registra emisión de solvencia
   * @param {string} userId - ID del usuario que emite
   * @param {Object} solvency - Datos de la solvencia
   */
  async logSolvencyIssued(userId, solvency) {
    return this.log({
      userId,
      action: 'SOLVENCY_ISSUED',
      module: 'TAX',
      entity: 'Solvency',
      entityId: solvency.id,
      newData: solvency,
      metadata: {
        taxpayerId: solvency.taxpayerId,
        solvencyType: solvency.solvencyType,
      },
    });
  }

  /**
   * Registra modificación de factura
   * @param {string} userId - ID del usuario
   * @param {Object} oldBill - Factura anterior
   * @param {Object} newBill - Factura modificada
   */
  async logBillModification(userId, oldBill, newBill) {
    return this.log({
      userId,
      action: 'BILL_MODIFIED',
      module: 'TAX',
      entity: 'TaxBill',
      entityId: newBill.id,
      oldData: oldBill,
      newData: newBill,
    });
  }

  /**
   * Registra anulación de factura
   * @param {string} userId - ID del usuario
   * @param {Object} bill - Factura anulada
   * @param {string} reason - Razón de anulación
   */
  async logBillCancellation(userId, bill, reason) {
    return this.log({
      userId,
      action: 'BILL_CANCELLED',
      module: 'TAX',
      entity: 'TaxBill',
      entityId: bill.id,
      oldData: bill,
      metadata: { reason },
    });
  }

  /**
   * Registra actualización masiva
   * @param {string} userId - ID del usuario
   * @param {string} operation - Tipo de operación
   * @param {Object} result - Resultado de la operación
   */
  async logMassUpdate(userId, operation, result) {
    return this.log({
      userId,
      action: 'MASS_UPDATE',
      module: 'TAX',
      entity: 'MassOperation',
      entityId: `${operation}-${Date.now()}`,
      metadata: {
        operation,
        itemsAffected: result.itemsAffected || result.propertiesAffected,
        ...result,
      },
    });
  }
}

export default new AuditService();
