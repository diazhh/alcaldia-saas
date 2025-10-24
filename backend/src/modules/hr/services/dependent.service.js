import prisma from '../../../config/database.js';

/**
 * Servicio para gestión de Dependientes de Empleados
 */
class DependentService {
  /**
   * Crear dependiente
   */
  async createDependent(data) {
    const { employeeId, ...dependentData } = data;

    // Verificar que el empleado existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    return await prisma.employeeDependent.create({
      data: {
        employeeId,
        ...dependentData,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Obtener dependientes de un empleado
   */
  async getDependentsByEmployee(employeeId) {
    return await prisma.employeeDependent.findMany({
      where: { employeeId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener dependiente por ID
   */
  async getDependentById(id) {
    return await prisma.employeeDependent.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Actualizar dependiente
   */
  async updateDependent(id, data) {
    return await prisma.employeeDependent.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar dependiente (soft delete)
   */
  async deleteDependent(id) {
    return await prisma.employeeDependent.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Contar dependientes por tipo de relación
   */
  async countByRelationship(employeeId) {
    const dependents = await prisma.employeeDependent.groupBy({
      by: ['relationship'],
      where: { employeeId, isActive: true },
      _count: true,
    });

    return dependents.reduce((acc, item) => {
      acc[item.relationship] = item._count;
      return acc;
    }, {});
  }

  /**
   * Obtener hijos menores de edad
   */
  async getMinorChildren(employeeId) {
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

    return await prisma.employeeDependent.findMany({
      where: {
        employeeId,
        relationship: 'CHILD',
        birthDate: { gte: eighteenYearsAgo },
        isActive: true,
      },
      orderBy: { birthDate: 'desc' },
    });
  }

  /**
   * Obtener dependientes que reciben beneficios específicos
   */
  async getDependentsWithBenefit(employeeId, benefitType) {
    const where = {
      employeeId,
      isActive: true,
    };

    switch (benefitType) {
      case 'health':
        where.receivesHealthInsurance = true;
        break;
      case 'school':
        where.receivesSchoolSupplies = true;
        break;
      case 'toys':
        where.receivesToys = true;
        break;
      case 'childBonus':
        where.receivesChildBonus = true;
        break;
    }

    return await prisma.employeeDependent.findMany({
      where,
      orderBy: { birthDate: 'desc' },
    });
  }

  /**
   * Calcular prima por hijos
   */
  async calculateChildBonus(employeeId, bonusPerChild = 150) {
    const children = await this.getMinorChildren(employeeId);
    const eligibleChildren = children.filter(child => child.receivesChildBonus);
    
    return {
      totalChildren: children.length,
      eligibleChildren: eligibleChildren.length,
      bonusAmount: eligibleChildren.length * bonusPerChild,
      children: eligibleChildren,
    };
  }

  /**
   * Estadísticas de dependientes
   */
  async getStatistics() {
    const [total, byRelationship, withHealthInsurance, withSchoolSupplies] = await Promise.all([
      prisma.employeeDependent.count({ where: { isActive: true } }),
      prisma.employeeDependent.groupBy({
        by: ['relationship'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.employeeDependent.count({
        where: { isActive: true, receivesHealthInsurance: true },
      }),
      prisma.employeeDependent.count({
        where: { isActive: true, receivesSchoolSupplies: true },
      }),
    ]);

    return {
      total,
      byRelationship: byRelationship.reduce((acc, item) => {
        acc[item.relationship] = item._count;
        return acc;
      }, {}),
      withHealthInsurance,
      withSchoolSupplies,
    };
  }

  /**
   * Listar todos los dependientes con filtros
   */
  async listDependents(filters = {}) {
    const { relationship, search, page = 1, limit = 50 } = filters;

    const where = { isActive: true };

    if (relationship) {
      where.relationship = relationship;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [dependents, total] = await Promise.all([
      prisma.employeeDependent.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employeeDependent.count({ where }),
    ]);

    return {
      dependents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new DependentService();
