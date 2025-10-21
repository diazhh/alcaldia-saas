import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de gestión de empleados
 */



/**
 * Generar número de empleado único
 * Formato: EMP-YYYY-NNNN
 */
async function generateEmployeeNumber() {
  const year = new Date().getFullYear();
  const prefix = `EMP-${year}-`;
  
  // Buscar el último número de empleado del año
  const lastEmployee = await prisma.employee.findFirst({
    where: {
      employeeNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      employeeNumber: 'desc',
    },
  });
  
  let nextNumber = 1;
  if (lastEmployee) {
    const lastNumber = parseInt(lastEmployee.employeeNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Obtener todos los empleados con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>}
 */
async function getAllEmployees(filters = {}) {
  const {
    status,
    departmentId,
    positionId,
    search,
    page = 1,
    limit = 50,
  } = filters;
  
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (departmentId) {
    where.departmentId = departmentId;
  }
  
  if (positionId) {
    where.positionId = positionId;
  }
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { idNumber: { contains: search } },
      { employeeNumber: { contains: search } },
    ];
  }
  
  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        position: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.employee.count({ where }),
  ]);
  
  return {
    data: employees,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un empleado por ID
 * @param {string} id - ID del empleado
 * @returns {Promise<Object>}
 */
async function getEmployeeById(id) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      position: true,
      supervisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          position: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  return employee;
}

/**
 * Obtener expediente completo de un empleado
 * @param {string} id - ID del empleado
 * @returns {Promise<Object>}
 */
async function getFullProfile(id) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      position: true,
      supervisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
        },
      },
      documents: {
        orderBy: {
          uploadDate: 'desc',
        },
      },
      evaluations: {
        orderBy: {
          year: 'desc',
        },
        take: 5,
      },
      trainings: {
        include: {
          training: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      vacationRequests: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      leaves: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Calcular días de vacaciones disponibles
  const vacationBalance = await calculateVacationBalance(id);
  
  // Obtener últimas prestaciones sociales
  const severancePayments = await prisma.severancePayment.findMany({
    where: { employeeId: id },
    orderBy: {
      year: 'desc',
      month: 'desc',
    },
    take: 12,
  });
  
  return {
    ...employee,
    vacationBalance,
    severancePayments,
  };
}

/**
 * Crear un nuevo empleado
 * @param {Object} data - Datos del empleado
 * @returns {Promise<Object>}
 */
async function createEmployee(data) {
  // Verificar que la cédula no esté duplicada
  const existingEmployee = await prisma.employee.findUnique({
    where: { idNumber: data.idNumber },
  });
  
  if (existingEmployee) {
    throw new AppError('Ya existe un empleado con esta cédula', 400);
  }
  
  // Verificar que el cargo exista
  const position = await prisma.position.findUnique({
    where: { id: data.positionId },
  });
  
  if (!position) {
    throw new AppError('Cargo no encontrado', 404);
  }
  
  // Generar número de empleado
  const employeeNumber = await generateEmployeeNumber();
  
  // Convertir fechas a objetos Date
  const employeeData = {
    ...data,
    employeeNumber,
    birthDate: new Date(data.birthDate),
    hireDate: new Date(data.hireDate),
  };
  
  const employee = await prisma.employee.create({
    data: employeeData,
    include: {
      position: true,
    },
  });
  
  return employee;
}

/**
 * Actualizar un empleado
 * @param {string} id - ID del empleado
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
async function updateEmployee(id, data) {
  const employee = await prisma.employee.findUnique({
    where: { id },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Si se actualiza la cédula, verificar que no esté duplicada
  if (data.idNumber && data.idNumber !== employee.idNumber) {
    const existingEmployee = await prisma.employee.findUnique({
      where: { idNumber: data.idNumber },
    });
    
    if (existingEmployee) {
      throw new AppError('Ya existe un empleado con esta cédula', 400);
    }
  }
  
  // Convertir fechas si vienen en el data
  const updateData = { ...data };
  if (data.birthDate) {
    updateData.birthDate = new Date(data.birthDate);
  }
  if (data.hireDate) {
    updateData.hireDate = new Date(data.hireDate);
  }
  
  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: updateData,
    include: {
      position: true,
    },
  });
  
  return updatedEmployee;
}

/**
 * Actualizar estado de un empleado
 * @param {string} id - ID del empleado
 * @param {string} status - Nuevo estado
 * @param {string} reason - Razón del cambio (opcional)
 * @returns {Promise<Object>}
 */
async function updateEmployeeStatus(id, status, reason = null) {
  const employee = await prisma.employee.findUnique({
    where: { id },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  const updateData = { status };
  
  // Si se marca como terminado, registrar fecha y razón
  if (status === 'TERMINATED' || status === 'RETIRED') {
    updateData.terminationDate = new Date();
    if (reason) {
      updateData.terminationReason = reason;
    }
  }
  
  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: updateData,
  });
  
  return updatedEmployee;
}

/**
 * Eliminar un empleado (soft delete)
 * @param {string} id - ID del empleado
 * @returns {Promise<Object>}
 */
async function deleteEmployee(id) {
  const employee = await prisma.employee.findUnique({
    where: { id },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Marcar como inactivo en lugar de eliminar
  const deletedEmployee = await prisma.employee.update({
    where: { id },
    data: {
      status: 'INACTIVE',
      terminationDate: new Date(),
    },
  });
  
  return deletedEmployee;
}

/**
 * Calcular saldo de vacaciones de un empleado
 * @param {string} employeeId - ID del empleado
 * @returns {Promise<Object>}
 */
async function calculateVacationBalance(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Calcular años de antigüedad
  const hireDate = new Date(employee.hireDate);
  const today = new Date();
  const yearsOfService = Math.floor((today - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Calcular días según ley venezolana
  let daysPerYear = 15; // Base: 1 año
  if (yearsOfService >= 2) {
    daysPerYear = 16 + Math.min(yearsOfService - 2, 9); // Incremento hasta 25 días
  }
  
  // Obtener vacaciones aprobadas
  const approvedVacations = await prisma.vacationRequest.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: {
        gte: new Date(today.getFullYear(), 0, 1), // Desde inicio del año
      },
    },
  });
  
  const usedDays = approvedVacations.reduce((sum, vac) => sum + vac.requestedDays, 0);
  
  return {
    totalDays: daysPerYear,
    usedDays,
    availableDays: daysPerYear - usedDays,
    yearsOfService,
  };
}

/**
 * Obtener estadísticas de empleados
 * @returns {Promise<Object>}
 */
async function getEmployeeStats() {
  const [
    totalActive,
    totalInactive,
    byDepartment,
    byPosition,
    byContractType,
  ] = await Promise.all([
    prisma.employee.count({ where: { status: 'ACTIVE' } }),
    prisma.employee.count({ where: { status: { not: 'ACTIVE' } } }),
    prisma.employee.groupBy({
      by: ['departmentId'],
      _count: true,
      where: { status: 'ACTIVE' },
    }),
    prisma.employee.groupBy({
      by: ['positionId'],
      _count: true,
      where: { status: 'ACTIVE' },
    }),
    prisma.employee.groupBy({
      by: ['contractType'],
      _count: true,
      where: { status: 'ACTIVE' },
    }),
  ]);
  
  return {
    totalActive,
    totalInactive,
    total: totalActive + totalInactive,
    byDepartment,
    byPosition,
    byContractType,
  };
}

export {
  getAllEmployees,
  getEmployeeById,
  getFullProfile,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  calculateVacationBalance,
  getEmployeeStats,
};
