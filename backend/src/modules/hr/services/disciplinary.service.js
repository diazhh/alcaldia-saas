import prisma from '../../../config/database.js';

/**
 * Servicio para gestión de Acciones Disciplinarias
 */
class DisciplinaryService {
  /**
   * Crear acción disciplinaria
   */
  async createAction(data, createdBy) {
    const { employeeId, type, severity, reason, description, evidence, witnesses } = data;

    // Verificar que el empleado existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    // Generar número de acción
    const year = new Date().getFullYear();
    const count = await prisma.disciplinaryAction.count();
    const actionNumber = `DISC-${year}-${String(count + 1).padStart(4, '0')}`;

    return await prisma.disciplinaryAction.create({
      data: {
        employeeId,
        actionNumber,
        type,
        severity,
        reason,
        description,
        evidence,
        witnesses,
        status: 'INITIATED',
        createdBy,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
    });
  }

  /**
   * Notificar al empleado
   */
  async notifyEmployee(actionId, data) {
    const { notificationMethod, responseDeadline } = data;

    return await prisma.disciplinaryAction.update({
      where: { id: actionId },
      data: {
        notifiedAt: new Date(),
        notificationMethod,
        responseDeadline,
        status: 'NOTIFIED',
      },
    });
  }

  /**
   * Registrar respuesta del empleado
   */
  async recordEmployeeResponse(actionId, response) {
    return await prisma.disciplinaryAction.update({
      where: { id: actionId },
      data: {
        employeeResponse: response,
        responseDate: new Date(),
        status: 'RESPONSE_RECEIVED',
      },
    });
  }

  /**
   * Tomar decisión sobre la acción disciplinaria
   */
  async makeDecision(actionId, data, decidedBy) {
    const { decision, suspensionDays, suspensionStart, suspensionEnd, withPay } = data;

    const updateData = {
      decision,
      decidedBy,
      decidedAt: new Date(),
      status: 'DECIDED',
    };

    // Si es suspensión, agregar datos de suspensión
    if (suspensionDays) {
      updateData.suspensionDays = suspensionDays;
      updateData.suspensionStart = suspensionStart;
      updateData.suspensionEnd = suspensionEnd;
      updateData.withPay = withPay;

      // Actualizar estado del empleado si es necesario
      if (!withPay) {
        await prisma.employee.update({
          where: { id: (await this.getActionById(actionId)).employeeId },
          data: { status: 'SUSPENDED' },
        });
      }
    }

    return await prisma.disciplinaryAction.update({
      where: { id: actionId },
      data: updateData,
    });
  }

  /**
   * Registrar apelación
   */
  async recordAppeal(actionId) {
    return await prisma.disciplinaryAction.update({
      where: { id: actionId },
      data: {
        appealed: true,
        appealDate: new Date(),
        status: 'APPEALED',
      },
    });
  }

  /**
   * Resolver apelación
   */
  async resolveAppeal(actionId, resolution) {
    return await prisma.disciplinaryAction.update({
      where: { id: actionId },
      data: {
        appealResolution: resolution,
        status: 'CLOSED',
      },
    });
  }

  /**
   * Cerrar acción disciplinaria
   */
  async closeAction(actionId) {
    return await prisma.disciplinaryAction.update({
      where: { id: actionId },
      data: { status: 'CLOSED' },
    });
  }

  /**
   * Cancelar acción disciplinaria
   */
  async cancelAction(actionId, reason) {
    return await prisma.disciplinaryAction.update({
      where: { id: actionId },
      data: {
        status: 'CANCELLED',
        notes: reason,
      },
    });
  }

  /**
   * Obtener acción por ID
   */
  async getActionById(id) {
    return await prisma.disciplinaryAction.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            position: true,
            departmentId: true,
          },
        },
      },
    });
  }

  /**
   * Obtener acciones de un empleado
   */
  async getActionsByEmployee(employeeId) {
    return await prisma.disciplinaryAction.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listar acciones disciplinarias con filtros
   */
  async listActions(filters = {}) {
    const { type, severity, status, employeeId, search, page = 1, limit = 50 } = filters;

    const where = {};

    if (type) {
      where.type = type;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (search) {
      where.OR = [
        { actionNumber: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        {
          employee: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { employeeNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [actions, total] = await Promise.all([
      prisma.disciplinaryAction.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
              position: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.disciplinaryAction.count({ where }),
    ]);

    return {
      actions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Estadísticas de acciones disciplinarias
   */
  async getStatistics() {
    const [total, byType, bySeverity, byStatus, pending] = await Promise.all([
      prisma.disciplinaryAction.count(),
      prisma.disciplinaryAction.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.disciplinaryAction.groupBy({
        by: ['severity'],
        _count: true,
      }),
      prisma.disciplinaryAction.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.disciplinaryAction.count({
        where: { status: { in: ['INITIATED', 'NOTIFIED', 'RESPONSE_RECEIVED', 'UNDER_REVIEW'] } },
      }),
    ]);

    return {
      total,
      pending,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {}),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item.severity] = item._count;
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
    };
  }

  /**
   * Obtener historial disciplinario de un empleado
   */
  async getEmployeeDisciplinaryHistory(employeeId) {
    const actions = await this.getActionsByEmployee(employeeId);

    const summary = {
      total: actions.length,
      verbalWarnings: actions.filter(a => a.type === 'VERBAL_WARNING').length,
      writtenWarnings: actions.filter(a => a.type === 'WRITTEN_WARNING').length,
      suspensions: actions.filter(a => a.type === 'SUSPENSION').length,
      terminations: actions.filter(a => a.type === 'TERMINATION').length,
      active: actions.filter(a => a.status !== 'CLOSED' && a.status !== 'CANCELLED').length,
    };

    return {
      summary,
      actions,
    };
  }
}

export default new DisciplinaryService();
