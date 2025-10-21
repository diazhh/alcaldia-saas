# Ejemplos de Uso del Sistema de Permisos

## Ejemplos Prácticos de Implementación

### 1. Proteger Rutas de Usuarios

```javascript
// backend/src/modules/users/routes.js
import { Router } from 'express';
import userController from './controllers/user.controller.js';
import { authenticate, authorize, requirePermission } from '../../shared/middlewares/auth.middleware.js';
import { MODULES, ACTIONS } from '../../shared/constants/permissions.js';

const router = Router();

// Listar usuarios - Solo usuarios con acceso al módulo
router.get(
  '/',
  authenticate,
  requirePermission(MODULES.USERS, ACTIONS.READ),
  userController.list
);

// Crear usuario - Solo ADMIN y SUPER_ADMIN
router.post(
  '/',
  authenticate,
  requirePermission(MODULES.USERS, ACTIONS.CREATE),
  userController.create
);

// Actualizar usuario - Solo ADMIN y SUPER_ADMIN
router.put(
  '/:id',
  authenticate,
  requirePermission(MODULES.USERS, ACTIONS.UPDATE),
  userController.update
);

// Eliminar usuario - Solo ADMIN y SUPER_ADMIN
router.delete(
  '/:id',
  authenticate,
  requirePermission(MODULES.USERS, ACTIONS.DELETE),
  userController.delete
);

export default router;
```

### 2. Proteger Rutas de Proyectos con Diferentes Niveles

```javascript
// backend/src/modules/projects/routes.js
import { Router } from 'express';
import projectController from './controllers/project.controller.js';
import { authenticate, requirePermission } from '../../shared/middlewares/auth.middleware.js';
import { MODULES, ACTIONS } from '../../shared/constants/permissions.js';

const router = Router();

// Listar proyectos - Todos los roles excepto CIUDADANO
router.get(
  '/',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.READ),
  projectController.list
);

// Ver detalle de proyecto - Todos los roles excepto CIUDADANO
router.get(
  '/:id',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.READ),
  projectController.getById
);

// Crear proyecto - COORDINADOR y superiores
router.post(
  '/',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.CREATE),
  projectController.create
);

// Actualizar proyecto - COORDINADOR y superiores
router.put(
  '/:id',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.UPDATE),
  projectController.update
);

// Aprobar proyecto - Solo DIRECTOR y superiores
router.post(
  '/:id/approve',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.APPROVE),
  projectController.approve
);

// Eliminar proyecto - Solo ADMIN y SUPER_ADMIN
router.delete(
  '/:id',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.DELETE),
  projectController.delete
);

// Exportar proyectos - COORDINADOR y superiores
router.get(
  '/export/excel',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.EXPORT),
  projectController.exportToExcel
);

export default router;
```

### 3. Verificación de Permisos en Controladores

```javascript
// backend/src/modules/projects/controllers/project.controller.js
import { hasPermission } from '../../../shared/constants/permissions.js';
import { MODULES, ACTIONS } from '../../../shared/constants/permissions.js';
import { AuthorizationError } from '../../../shared/utils/errors.js';

class ProjectController {
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { status, budget } = req.body;
      const { role, id: userId } = req.user;
      
      // Buscar proyecto
      const project = await prisma.project.findUnique({ where: { id } });
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }
      
      // Verificar si está intentando cambiar el estado a "aprobado"
      if (status === 'approved') {
        if (!hasPermission(role, MODULES.PROJECTS, ACTIONS.APPROVE)) {
          throw new AuthorizationError('No tiene permisos para aprobar proyectos');
        }
      }
      
      // Verificar si está intentando modificar el presupuesto
      if (budget && budget !== project.budget) {
        if (!hasPermission(role, MODULES.BUDGETS, ACTIONS.UPDATE)) {
          throw new AuthorizationError('No tiene permisos para modificar el presupuesto');
        }
      }
      
      // Actualizar proyecto
      const updatedProject = await prisma.project.update({
        where: { id },
        data: req.body
      });
      
      res.json({
        success: true,
        data: updatedProject
      });
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { role, id: userId } = req.user;
      
      // Buscar proyecto
      const project = await prisma.project.findUnique({ 
        where: { id },
        include: { tasks: true }
      });
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        });
      }
      
      // Si el proyecto tiene tareas, solo SUPER_ADMIN puede eliminarlo
      if (project.tasks.length > 0 && role !== 'SUPER_ADMIN') {
        throw new AuthorizationError(
          'Solo SUPER_ADMIN puede eliminar proyectos con tareas asociadas'
        );
      }
      
      // Eliminar proyecto
      await prisma.project.delete({ where: { id } });
      
      res.json({
        success: true,
        message: 'Proyecto eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();
```

### 4. Verificación de Permisos en Servicios

```javascript
// backend/src/modules/budgets/services/budget.service.js
import { hasPermission, getModulePermissions } from '../../../shared/constants/permissions.js';
import { MODULES, ACTIONS } from '../../../shared/constants/permissions.js';
import { AuthorizationError } from '../../../shared/utils/errors.js';

class BudgetService {
  async createBudget(userId, userRole, budgetData) {
    // Verificar permiso
    if (!hasPermission(userRole, MODULES.BUDGETS, ACTIONS.CREATE)) {
      throw new AuthorizationError('No tiene permisos para crear presupuestos');
    }
    
    // Crear presupuesto
    const budget = await prisma.budget.create({
      data: {
        ...budgetData,
        createdBy: userId,
        status: 'draft'
      }
    });
    
    return budget;
  }
  
  async approveBudget(userId, userRole, budgetId) {
    // Verificar permiso de aprobación
    if (!hasPermission(userRole, MODULES.BUDGETS, ACTIONS.APPROVE)) {
      throw new AuthorizationError('No tiene permisos para aprobar presupuestos');
    }
    
    // Actualizar presupuesto
    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date()
      }
    });
    
    return budget;
  }
  
  async getBudgetsByDepartment(userRole, departmentId) {
    // DIRECTOR solo puede ver presupuestos de su departamento
    if (userRole === 'DIRECTOR') {
      // Verificar que el usuario pertenece al departamento
      // ... lógica de verificación
    }
    
    const budgets = await prisma.budget.findMany({
      where: { departmentId }
    });
    
    return budgets;
  }
}

export default new BudgetService();
```

### 5. Middleware Personalizado para Ownership

```javascript
// backend/src/shared/middlewares/ownership.middleware.js
import prisma from '../../config/database.js';
import { AuthorizationError, NotFoundError } from '../utils/errors.js';

/**
 * Middleware para verificar que el usuario es dueño del recurso
 * o tiene permisos suficientes para acceder
 */
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const { id: userId, role } = req.user;
      
      // SUPER_ADMIN y ADMIN siempre tienen acceso
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        return next();
      }
      
      // Buscar recurso según el tipo
      let resource;
      switch (resourceType) {
        case 'project':
          resource = await prisma.project.findUnique({
            where: { id },
            select: { managerId: true }
          });
          break;
        case 'task':
          resource = await prisma.task.findUnique({
            where: { id },
            select: { assignedTo: true }
          });
          break;
        // ... otros tipos de recursos
        default:
          throw new Error(`Tipo de recurso no soportado: ${resourceType}`);
      }
      
      if (!resource) {
        throw new NotFoundError('Recurso no encontrado');
      }
      
      // Verificar ownership
      const ownerId = resource.managerId || resource.assignedTo;
      if (ownerId !== userId) {
        throw new AuthorizationError('No tiene permisos para acceder a este recurso');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Uso en rutas:
// router.put('/projects/:id', authenticate, requireOwnership('project'), projectController.update);
```

### 6. Obtener Permisos del Usuario en el Frontend

```javascript
// frontend/src/hooks/usePermissions.js
import { useAuthStore } from '../store/auth';
import { MODULES, ACTIONS } from '../constants/permissions';

export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasPermission = (module, action) => {
    if (!user) return false;
    
    // Llamar al endpoint para verificar permisos
    // O mantener los permisos en el store después del login
    return user.permissions?.[module]?.includes(action) || false;
  };
  
  const canCreate = (module) => hasPermission(module, ACTIONS.CREATE);
  const canRead = (module) => hasPermission(module, ACTIONS.READ);
  const canUpdate = (module) => hasPermission(module, ACTIONS.UPDATE);
  const canDelete = (module) => hasPermission(module, ACTIONS.DELETE);
  const canApprove = (module) => hasPermission(module, ACTIONS.APPROVE);
  
  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canApprove
  };
};

// Uso en componentes:
// const { canCreate, canDelete } = usePermissions();
// 
// {canCreate(MODULES.PROJECTS) && (
//   <Button onClick={handleCreate}>Crear Proyecto</Button>
// )}
```

### 7. Componente de Protección en Frontend

```jsx
// frontend/src/components/ProtectedAction.jsx
import { usePermissions } from '../hooks/usePermissions';

export const ProtectedAction = ({ module, action, children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(module, action)) {
    return fallback;
  }
  
  return children;
};

// Uso:
// <ProtectedAction module={MODULES.PROJECTS} action={ACTIONS.DELETE}>
//   <Button variant="destructive" onClick={handleDelete}>
//     Eliminar
//   </Button>
// </ProtectedAction>
```

### 8. Testing de Permisos

```javascript
// backend/tests/permissions.test.js
import { hasPermission, getModulePermissions } from '../src/shared/constants/permissions.js';
import { MODULES, ACTIONS, ROLES } from '../src/shared/constants/permissions.js';

describe('Sistema de Permisos', () => {
  describe('SUPER_ADMIN', () => {
    test('tiene acceso a todos los módulos', () => {
      expect(hasPermission(ROLES.SUPER_ADMIN, MODULES.BUDGETS, ACTIONS.DELETE)).toBe(true);
      expect(hasPermission(ROLES.SUPER_ADMIN, MODULES.USERS, ACTIONS.MANAGE)).toBe(true);
    });
  });
  
  describe('EMPLEADO', () => {
    test('puede leer proyectos pero no crearlos', () => {
      expect(hasPermission(ROLES.EMPLEADO, MODULES.PROJECTS, ACTIONS.READ)).toBe(true);
      expect(hasPermission(ROLES.EMPLEADO, MODULES.PROJECTS, ACTIONS.CREATE)).toBe(false);
    });
    
    test('no tiene acceso a presupuestos', () => {
      expect(hasPermission(ROLES.EMPLEADO, MODULES.BUDGETS, ACTIONS.READ)).toBe(true);
      expect(hasPermission(ROLES.EMPLEADO, MODULES.BUDGETS, ACTIONS.CREATE)).toBe(false);
    });
  });
  
  describe('DIRECTOR', () => {
    test('puede aprobar proyectos', () => {
      expect(hasPermission(ROLES.DIRECTOR, MODULES.PROJECTS, ACTIONS.APPROVE)).toBe(true);
    });
    
    test('puede crear y aprobar gastos', () => {
      expect(hasPermission(ROLES.DIRECTOR, MODULES.EXPENSES, ACTIONS.CREATE)).toBe(true);
      expect(hasPermission(ROLES.DIRECTOR, MODULES.EXPENSES, ACTIONS.APPROVE)).toBe(true);
    });
  });
  
  describe('CIUDADANO', () => {
    test('puede crear peticiones pero no aprobarlas', () => {
      expect(hasPermission(ROLES.CIUDADANO, MODULES.PETITIONS, ACTIONS.CREATE)).toBe(true);
      expect(hasPermission(ROLES.CIUDADANO, MODULES.PETITIONS, ACTIONS.APPROVE)).toBe(false);
    });
    
    test('no tiene acceso a usuarios', () => {
      const permissions = getModulePermissions(ROLES.CIUDADANO, MODULES.USERS);
      expect(permissions).toEqual([]);
    });
  });
});
```

## Resumen de Mejores Prácticas

1. **Siempre proteger rutas** con `authenticate` y `requirePermission`
2. **Verificar permisos en controladores** para lógica compleja
3. **Usar constantes** en lugar de strings hardcodeados
4. **Registrar accesos denegados** automáticamente (ya implementado)
5. **Mantener permisos en el frontend** sincronizados con el backend
6. **Escribir tests** para verificar la matriz de permisos
7. **Documentar cambios** en la matriz de permisos
