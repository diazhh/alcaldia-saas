import express from 'express';
import departmentController from './department.controller.js';
import userDepartmentController from './user-department.controller.js';
import permissionController from './permission.controller.js';
import reportsController from './reports.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/role.middleware.js';

const router = express.Router();

/**
 * Rutas para gestión de departamentos
 * Todas las rutas requieren autenticación
 */

// ============================================
// RUTAS DE REPORTES Y ESTADÍSTICAS (DEBEN IR PRIMERO)
// ============================================

// Obtener estadísticas generales
router.get('/reports/stats', authenticate, reportsController.getGeneralStats);

// Obtener empleados por departamento
router.get('/reports/employees', authenticate, reportsController.getEmployeesByDepartment);

// Obtener departamentos sin jefe
router.get('/reports/without-head', authenticate, reportsController.getDepartmentsWithoutHead);

// Obtener usuarios sin departamento
router.get('/reports/users-without-dept', authenticate, reportsController.getUsersWithoutDepartment);

// Obtener distribución de personal por nivel
router.get('/reports/staff-distribution', authenticate, reportsController.getStaffDistribution);

// Obtener datos para organigrama
router.get('/reports/org-chart', authenticate, reportsController.getOrgChartData);

// Obtener directorio telefónico
router.get('/reports/phone-directory', authenticate, reportsController.getPhoneDirectory);

// ============================================
// RUTAS DE DEPARTAMENTOS
// ============================================

// Obtener árbol jerárquico de departamentos
router.get('/tree', authenticate, departmentController.getTree);

// Listar departamentos (con filtros y paginación)
router.get('/', authenticate, departmentController.list);

// Obtener ancestros de un departamento
router.get('/:id/ancestors', authenticate, departmentController.getAncestors);

// Obtener descendientes de un departamento
router.get('/:id/descendants', authenticate, departmentController.getDescendants);

// Obtener path completo de un departamento
router.get('/:id/path', authenticate, departmentController.getPath);

// Obtener estadísticas de jerarquía
router.get('/:id/stats', authenticate, departmentController.getHierarchyStats);

// Obtener hijos directos (children)
router.get('/:id/children', authenticate, departmentController.getChildren);

// Obtener personal del departamento (staff)
router.get('/:id/staff', authenticate, departmentController.getStaff);

// Obtener un departamento por ID
router.get('/:id', authenticate, departmentController.getById);

// Crear un nuevo departamento (solo ADMIN y SUPER_ADMIN)
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), departmentController.create);

// Actualizar un departamento (solo ADMIN y SUPER_ADMIN)
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), departmentController.update);

// Eliminar un departamento (solo SUPER_ADMIN)
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), departmentController.delete);

// Mover departamento en jerarquía (solo ADMIN y SUPER_ADMIN)
router.post('/:id/move', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), departmentController.move);

// ============================================
// RUTAS DE ASIGNACIÓN DE USUARIOS
// ============================================

// Listar usuarios de un departamento
router.get('/:departmentId/users', authenticate, userDepartmentController.listDepartmentUsers);

// Asignar usuario a departamento (solo ADMIN y SUPER_ADMIN)
router.post(
  '/:departmentId/users',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']),
  userDepartmentController.assignUser
);

// Actualizar rol de usuario en departamento (solo ADMIN y SUPER_ADMIN)
router.put(
  '/:departmentId/users/:userId',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']),
  userDepartmentController.updateUserRole
);

// Transferir usuario entre departamentos (solo ADMIN y SUPER_ADMIN)
router.post(
  '/:departmentId/users/:userId/transfer',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']),
  userDepartmentController.transferUser
);

// Remover usuario de departamento (solo ADMIN y SUPER_ADMIN)
router.delete(
  '/:departmentId/users/:userId',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']),
  userDepartmentController.removeUser
);

// ============================================
// RUTAS DE USUARIOS
// ============================================

// Listar departamentos de un usuario
router.get('/users/:userId/departments', authenticate, userDepartmentController.listUserDepartments);

// ============================================
// RUTAS DE PERMISOS
// ============================================

// Listar permisos de un departamento
router.get('/:departmentId/permissions', authenticate, permissionController.listDepartmentPermissions);

// Obtener permisos de un usuario
router.get('/users/:userId/permissions', authenticate, permissionController.getUserPermissions);

// Asignar permiso a departamento (solo ADMIN y SUPER_ADMIN)
router.post(
  '/:departmentId/permissions',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  permissionController.assignPermission
);

// Asignar permisos en lote (solo ADMIN y SUPER_ADMIN)
router.post(
  '/:departmentId/permissions/bulk',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  permissionController.assignBulkPermissions
);

// Copiar permisos de un departamento a otro (solo ADMIN y SUPER_ADMIN)
router.post(
  '/:departmentId/permissions/copy',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  permissionController.copyPermissions
);

// Remover permiso (solo ADMIN y SUPER_ADMIN)
router.delete(
  '/permissions/:permissionId',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  permissionController.removePermission
);

export default router;
