import prisma from '../../config/database.js';

/**
 * Servicio para reportes y estadísticas de estructura organizacional
 */
class DepartmentReportsService {
  /**
   * Obtener empleados por departamento
   * @param {string} departmentId - ID del departamento (opcional)
   * @returns {Promise<Array>} Lista de departamentos con conteo de empleados
   */
  async getEmployeesByDepartment(departmentId = null) {
    const where = departmentId ? { id: departmentId } : {};

    const departments = await prisma.department.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        maxStaff: true,
        _count: {
          select: {
            users: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return departments.map((dept) => ({
      id: dept.id,
      code: dept.code,
      name: dept.name,
      type: dept.type,
      maxStaff: dept.maxStaff,
      currentStaff: dept._count.users,
      utilization: dept.maxStaff ? ((dept._count.users / dept.maxStaff) * 100).toFixed(2) : null,
      employees: dept.users.map((ud) => ({
        ...ud.user,
        departmentRole: ud.role,
        isPrimary: ud.isPrimary,
        assignedAt: ud.assignedAt,
      })),
    }));
  }

  /**
   * Obtener departamentos sin jefe
   * @returns {Promise<Array>} Lista de departamentos sin jefe asignado
   */
  async getDepartmentsWithoutHead() {
    const departments = await prisma.department.findMany({
      where: {
        headUserId: null,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { type: 'asc' },
    });

    return departments;
  }

  /**
   * Obtener usuarios sin departamento asignado
   * @returns {Promise<Array>} Lista de usuarios sin departamento
   */
  async getUsersWithoutDepartment() {
    const allUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          not: 'CIUDADANO', // Excluir ciudadanos
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        departments: true,
      },
    });

    // Filtrar usuarios que no tienen departamentos
    const usersWithoutDept = allUsers.filter((user) => user.departments.length === 0);

    return usersWithoutDept.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
    }));
  }

  /**
   * Obtener distribución de personal por nivel jerárquico
   * @returns {Promise<Object>} Distribución por tipo de departamento
   */
  async getStaffDistributionByLevel() {
    const distribution = await prisma.department.groupBy({
      by: ['type'],
      where: {
        isActive: true,
      },
      _count: {
        _all: true,
      },
    });

    // Obtener conteo de empleados por tipo de departamento
    const staffByType = await Promise.all(
      distribution.map(async (item) => {
        const userCount = await prisma.userDepartment.count({
          where: {
            department: {
              type: item.type,
              isActive: true,
            },
          },
        });

        return {
          type: item.type,
          departmentCount: item._count._all,
          employeeCount: userCount,
          avgEmployeesPerDept: userCount > 0 ? (userCount / item._count._all).toFixed(2) : 0,
        };
      })
    );

    return staffByType;
  }

  /**
   * Obtener datos para organigrama
   * @param {string} rootDepartmentId - ID del departamento raíz (opcional)
   * @returns {Promise<Object>} Datos estructurados para organigrama
   */
  async getOrgChartData(rootDepartmentId = null) {
    const where = rootDepartmentId ? { id: rootDepartmentId } : { parentId: null };

    const buildOrgChart = async (parentId = null) => {
      const departments = await prisma.department.findMany({
        where: {
          parentId,
          isActive: true,
        },
        include: {
          users: {
            where: {
              role: 'HEAD',
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              users: true,
              children: true,
            },
          },
        },
        orderBy: { code: 'asc' },
      });

      return Promise.all(
        departments.map(async (dept) => ({
          id: dept.id,
          code: dept.code,
          name: dept.name,
          type: dept.type,
          head: dept.users[0]?.user || null,
          employeeCount: dept._count.users,
          childrenCount: dept._count.children,
          children: await buildOrgChart(dept.id),
        }))
      );
    };

    if (rootDepartmentId) {
      const rootDept = await prisma.department.findUnique({
        where: { id: rootDepartmentId },
        include: {
          users: {
            where: { role: 'HEAD' },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              users: true,
              children: true,
            },
          },
        },
      });

      return {
        id: rootDept.id,
        code: rootDept.code,
        name: rootDept.name,
        type: rootDept.type,
        head: rootDept.users[0]?.user || null,
        employeeCount: rootDept._count.users,
        childrenCount: rootDept._count.children,
        children: await buildOrgChart(rootDepartmentId),
      };
    }

    const roots = await buildOrgChart(null);
    return roots;
  }

  /**
   * Obtener estadísticas generales de la estructura organizacional
   * @returns {Promise<Object>} Estadísticas generales
   */
  async getGeneralStats() {
    try {
      // Total de departamentos
      const totalDepartments = await prisma.department.count({
        where: { isActive: true },
      });

    // Total de empleados asignados
    const totalAssignments = await prisma.userDepartment.count();

    // Total de empleados únicos
    const uniqueEmployees = await prisma.userDepartment.groupBy({
      by: ['userId'],
    });

    // Departamentos por tipo
    const departmentsByType = await prisma.department.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { _all: true },
    });

    // Departamentos sin jefe
    const deptsWithoutHead = await prisma.department.count({
      where: {
        headUserId: null,
        isActive: true,
      },
    });

    // Usuarios sin departamento
    const allActiveUsers = await prisma.user.count({
      where: {
        isActive: true,
        role: { not: 'CIUDADANO' },
      },
    });

    const usersWithDept = uniqueEmployees.length;
    const usersWithoutDept = allActiveUsers - usersWithDept;

    // Nivel más profundo de jerarquía
    const maxDepth = await this.getMaxHierarchyDepth();

    // Departamento con más empleados
    const deptWithMostEmployees = await prisma.department.findFirst({
      where: { isActive: true },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
    });

    // Top departamentos por número de empleados
    const topDepartmentsByEmployees = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Departamentos activos
    const activeDepartments = await prisma.department.count({
      where: { isActive: true },
    });

    return {
      totalDepartments,
      activeDepartments,
      totalAssignments,
      uniqueEmployees: usersWithDept,
      usersWithoutDepartment: usersWithoutDept,
      byType: departmentsByType.reduce((acc, item) => {
        acc[item.type] = item._count._all;
        return acc;
      }, {}),
      departmentsByType: departmentsByType.reduce((acc, item) => {
        acc[item.type] = item._count._all;
        return acc;
      }, {}),
      departmentsWithoutHead: deptsWithoutHead,
      maxHierarchyDepth: maxDepth,
      largestDepartment: deptWithMostEmployees
        ? {
            id: deptWithMostEmployees.id,
            code: deptWithMostEmployees.code,
            name: deptWithMostEmployees.name,
            employeeCount: deptWithMostEmployees._count.users,
          }
        : null,
      topDepartmentsByEmployees: topDepartmentsByEmployees.map(dept => ({
        id: dept.id,
        code: dept.code,
        name: dept.name,
        employeeCount: dept._count.users,
      })),
    };
    } catch (error) {
      console.error('Error getting general stats:', error);
      throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
    }
  }

  /**
   * Obtener la profundidad máxima de la jerarquía
   * @returns {Promise<number>} Profundidad máxima
   */
  async getMaxHierarchyDepth() {
    try {
      const result = await prisma.$queryRaw`
        WITH RECURSIVE hierarchy AS (
          SELECT id, parent_id, 1 as depth
          FROM departments
          WHERE parent_id IS NULL
          
          UNION ALL
          
          SELECT d.id, d.parent_id, h.depth + 1
          FROM departments d
          INNER JOIN hierarchy h ON d.parent_id = h.id
        )
        SELECT MAX(depth) as max_depth
        FROM hierarchy;
      `;

      return Number(result[0]?.max_depth) || 0;
    } catch (error) {
      console.error('Error calculating max hierarchy depth:', error);
      return 0;
    }
  }

  /**
   * Obtener directorio telefónico
   * @param {string} departmentId - ID del departamento (opcional)
   * @returns {Promise<Array>} Directorio de empleados
   */
  async getPhoneDirectory(departmentId = null) {
    const where = departmentId ? { departmentId } : {};

    const assignments = await prisma.userDepartment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: [
        { department: { code: 'asc' } },
        { role: 'asc' },
        { user: { lastName: 'asc' } },
      ],
    });

    return assignments.map((assignment) => ({
      employee: {
        id: assignment.user.id,
        name: `${assignment.user.firstName} ${assignment.user.lastName}`,
        email: assignment.user.email,
        phone: assignment.user.phone,
        systemRole: assignment.user.role,
      },
      department: {
        id: assignment.department.id,
        code: assignment.department.code,
        name: assignment.department.name,
        type: assignment.department.type,
        phone: assignment.department.phone,
        email: assignment.department.email,
      },
      departmentRole: assignment.role,
      isPrimary: assignment.isPrimary,
    }));
  }
}

export default new DepartmentReportsService();
