import prisma from '../../config/database.js';
import { AppError } from '../../shared/utils/errors.js';

/**
 * Servicio para gestión de departamentos
 */
class DepartmentService {
  /**
   * Crear un nuevo departamento
   * @param {Object} data - Datos del departamento
   * @returns {Promise<Object>} Departamento creado
   */
  async createDepartment(data) {
    // Verificar que el código sea único
    const existingCode = await prisma.department.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      throw new AppError('Ya existe un departamento con ese código', 400);
    }

    // Si tiene padre, verificar que existe y que no se crea un ciclo
    if (data.parentId) {
      const parent = await prisma.department.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new AppError('El departamento padre no existe', 404);
      }

      // Verificar que el tipo sea coherente con la jerarquía
      const typeHierarchy = ['DIRECCION', 'COORDINACION', 'DEPARTAMENTO', 'UNIDAD', 'SECCION', 'OFICINA'];
      const parentTypeIndex = typeHierarchy.indexOf(parent.type);
      const childTypeIndex = typeHierarchy.indexOf(data.type);

      if (childTypeIndex <= parentTypeIndex) {
        throw new AppError(
          `Un ${data.type} no puede ser hijo de un ${parent.type}. La jerarquía debe ser: DIRECCION > COORDINACION > DEPARTAMENTO > UNIDAD > SECCION > OFICINA`,
          400
        );
      }
    }

    // Crear el departamento
    const department = await prisma.department.create({
      data,
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return department;
  }

  /**
   * Listar departamentos (plano o jerárquico)
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Lista de departamentos con metadata
   */
  async listDepartments(filters = {}) {
    const { page = 1, limit = 10, type, parentId, isActive, search, hierarchical = false } = filters;

    // Si se solicita vista jerárquica, retornar árbol completo
    if (hierarchical) {
      return this.getDepartmentTree();
    }

    // Construir filtros
    const where = {};

    if (type) where.type = type;
    if (parentId !== undefined) where.parentId = parentId;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Contar total
    const total = await prisma.department.count({ where });

    // Obtener departamentos
    const skip = (page - 1) * limit;
    const departments = await prisma.department.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            children: true,
            users: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { code: 'asc' }],
    });

    return {
      data: departments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Obtener árbol jerárquico de departamentos
   * @returns {Promise<Array>} Árbol de departamentos
   */
  async getDepartmentTree() {
    // Obtener todos los departamentos activos
    const allDepartments = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            children: true,
            users: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    // Construir árbol recursivamente
    const buildTree = (parentId = null) => {
      return allDepartments
        .filter((dept) => dept.parentId === parentId)
        .map((dept) => ({
          ...dept,
          children: buildTree(dept.id),
        }));
    };

    return buildTree();
  }

  /**
   * Obtener un departamento por ID
   * @param {string} id - ID del departamento
   * @returns {Promise<Object>} Departamento encontrado
   */
  async getDepartmentById(id) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
        children: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            isActive: true,
            _count: {
              select: {
                users: true,
              },
            },
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
                phone: true,
                avatar: true,
              },
            },
          },
        },
        permissions: true,
        _count: {
          select: {
            children: true,
            users: true,
            permissions: true,
          },
        },
      },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    return department;
  }

  /**
   * Actualizar un departamento
   * @param {string} id - ID del departamento
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Departamento actualizado
   */
  async updateDepartment(id, data) {
    // Verificar que existe
    const existing = await prisma.department.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Si se cambia el código, verificar que sea único
    if (data.code && data.code !== existing.code) {
      const existingCode = await prisma.department.findUnique({
        where: { code: data.code },
      });

      if (existingCode) {
        throw new AppError('Ya existe un departamento con ese código', 400);
      }
    }

    // Si se cambia el padre, verificar que no se crea un ciclo
    if (data.parentId !== undefined && data.parentId !== existing.parentId) {
      if (data.parentId) {
        // Verificar que el nuevo padre existe
        const newParent = await prisma.department.findUnique({
          where: { id: data.parentId },
        });

        if (!newParent) {
          throw new AppError('El departamento padre no existe', 404);
        }

        // Verificar que no se crea un ciclo (el nuevo padre no puede ser un descendiente)
        const isDescendant = await this.isDescendant(id, data.parentId);
        if (isDescendant) {
          throw new AppError('No se puede mover un departamento a uno de sus descendientes', 400);
        }
      }
    }

    // Actualizar
    const updated = await prisma.department.update({
      where: { id },
      data,
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Eliminar un departamento
   * @param {string} id - ID del departamento
   * @returns {Promise<void>}
   */
  async deleteDepartment(id) {
    // Verificar que existe
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            users: true,
          },
        },
      },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // No permitir eliminar si tiene hijos
    if (department._count.children > 0) {
      throw new AppError('No se puede eliminar un departamento que tiene subdepartamentos', 400);
    }

    // No permitir eliminar si tiene usuarios asignados
    if (department._count.users > 0) {
      throw new AppError('No se puede eliminar un departamento que tiene usuarios asignados', 400);
    }

    // Eliminar
    await prisma.department.delete({
      where: { id },
    });
  }

  /**
   * Verificar si un departamento es descendiente de otro
   * @param {string} ancestorId - ID del posible ancestro
   * @param {string} descendantId - ID del posible descendiente
   * @returns {Promise<boolean>}
   */
  async isDescendant(ancestorId, descendantId) {
    if (ancestorId === descendantId) return true;

    const descendant = await prisma.department.findUnique({
      where: { id: descendantId },
      select: { parentId: true },
    });

    if (!descendant || !descendant.parentId) return false;

    return this.isDescendant(ancestorId, descendant.parentId);
  }

  /**
   * Obtener todos los ancestros de un departamento (desde el padre hasta la raíz)
   * Usa CTE recursivo de PostgreSQL para eficiencia
   * @param {string} departmentId - ID del departamento
   * @returns {Promise<Array>} Lista de ancestros ordenados de padre a raíz
   */
  async getAncestors(departmentId) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Si no tiene padre, retornar array vacío
    if (!department.parentId) {
      return [];
    }

    // Query recursivo para obtener ancestros
    const ancestors = await prisma.$queryRaw`
      WITH RECURSIVE ancestors AS (
        -- Caso base: obtener el departamento padre directo
        SELECT d.id, d.code, d.name, d.type, d.parent_id, 1 as level
        FROM departments d
        WHERE d.id = ${department.parentId}::uuid
        
        UNION ALL
        
        -- Caso recursivo: obtener el padre del ancestro actual
        SELECT d.id, d.code, d.name, d.type, d.parent_id, a.level + 1
        FROM departments d
        INNER JOIN ancestors a ON d.id = a.parent_id
      )
      SELECT id, code, name, type, parent_id as "parentId", level
      FROM ancestors
      ORDER BY level ASC;
    `;

    return ancestors;
  }

  /**
   * Obtener todos los descendientes de un departamento (todo el subárbol)
   * Usa CTE recursivo de PostgreSQL para eficiencia
   * @param {string} departmentId - ID del departamento
   * @returns {Promise<Array>} Lista de descendientes con su nivel en la jerarquía
   */
  async getDescendants(departmentId) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Query recursivo para obtener descendientes
    const descendants = await prisma.$queryRaw`
      WITH RECURSIVE descendants AS (
        -- Caso base: obtener los hijos directos
        SELECT d.id, d.code, d.name, d.type, d.parent_id, d.is_active, 1 as level
        FROM departments d
        WHERE d.parent_id = ${departmentId}::uuid
        
        UNION ALL
        
        -- Caso recursivo: obtener los hijos de cada descendiente
        SELECT d.id, d.code, d.name, d.type, d.parent_id, d.is_active, dt.level + 1
        FROM departments d
        INNER JOIN descendants dt ON d.parent_id = dt.id
      )
      SELECT 
        id, 
        code, 
        name, 
        type, 
        parent_id as "parentId", 
        is_active as "isActive",
        level
      FROM descendants
      ORDER BY level ASC, code ASC;
    `;

    return descendants;
  }

  /**
   * Obtener el path completo de un departamento (desde la raíz hasta el departamento)
   * @param {string} departmentId - ID del departamento
   * @returns {Promise<Array>} Path completo ordenado de raíz a departamento
   */
  async getDepartmentPath(departmentId) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
      },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Obtener ancestros
    const ancestors = await this.getAncestors(departmentId);

    // Construir path: ancestros (de raíz a padre) + departamento actual
    const path = [...ancestors.reverse(), department];

    return path;
  }

  /**
   * Obtener estadísticas de la jerarquía de un departamento
   * @param {string} departmentId - ID del departamento
   * @returns {Promise<Object>} Estadísticas de la jerarquía
   */
  async getHierarchyStats(departmentId) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Obtener descendientes
    const descendants = await this.getDescendants(departmentId);

    // Calcular estadísticas
    const totalDescendants = descendants.length;
    const maxDepth = descendants.length > 0 ? Math.max(...descendants.map((d) => d.level)) : 0;

    // Contar usuarios en todo el subárbol
    const descendantIds = descendants.map((d) => d.id);
    const totalUsers = await prisma.userDepartment.count({
      where: {
        departmentId: {
          in: [departmentId, ...descendantIds],
        },
      },
    });

    // Contar por tipo
    const byType = descendants.reduce((acc, dept) => {
      acc[dept.type] = (acc[dept.type] || 0) + 1;
      return acc;
    }, {});

    return {
      department: {
        id: department.id,
        code: department.code,
        name: department.name,
        type: department.type,
      },
      stats: {
        totalDescendants,
        maxDepth,
        totalUsers,
        descendantsByType: byType,
        directChildren: descendants.filter((d) => d.level === 1).length,
      },
    };
  }

  /**
   * Obtener hijos directos de un departamento
   * @param {string} departmentId - ID del departamento
   * @returns {Promise<Array>} Lista de hijos directos
   */
  async getChildren(departmentId) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Obtener hijos directos
    const children = await prisma.department.findMany({
      where: { parentId: departmentId },
      include: {
        _count: {
          select: {
            children: true,
            users: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return children;
  }

  /**
   * Obtener personal de un departamento
   * @param {string} departmentId - ID del departamento
   * @returns {Promise<Array>} Lista de usuarios del departamento
   */
  async getStaff(departmentId) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Obtener usuarios del departamento
    const staff = await prisma.userDepartment.findMany({
      where: { departmentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    });

    return staff;
  }

  /**
   * Mover un departamento a un nuevo padre
   * @param {string} departmentId - ID del departamento a mover
   * @param {string|null} newParentId - ID del nuevo padre (null para raíz)
   * @returns {Promise<Object>} Departamento actualizado
   */
  async moveDepartment(departmentId, newParentId) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Si tiene nuevo padre, verificar que existe y no crea ciclo
    if (newParentId) {
      const newParent = await prisma.department.findUnique({
        where: { id: newParentId },
      });

      if (!newParent) {
        throw new AppError('El departamento padre no existe', 404);
      }

      // Verificar que no se crea un ciclo
      const isDescendant = await this.isDescendant(departmentId, newParentId);
      if (isDescendant) {
        throw new AppError('No se puede mover un departamento a uno de sus descendientes', 400);
      }

      // Verificar jerarquía de tipos
      const typeHierarchy = ['DIRECCION', 'COORDINACION', 'DEPARTAMENTO', 'UNIDAD', 'SECCION', 'OFICINA'];
      const parentTypeIndex = typeHierarchy.indexOf(newParent.type);
      const childTypeIndex = typeHierarchy.indexOf(department.type);

      if (childTypeIndex <= parentTypeIndex) {
        throw new AppError(
          `Un ${department.type} no puede ser hijo de un ${newParent.type}. La jerarquía debe ser: DIRECCION > COORDINACION > DEPARTAMENTO > UNIDAD > SECCION > OFICINA`,
          400
        );
      }
    }

    // Mover el departamento
    const updated = await prisma.department.update({
      where: { id: departmentId },
      data: { parentId: newParentId },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return updated;
  }
}

export default new DepartmentService();
