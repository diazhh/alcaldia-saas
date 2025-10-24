import express from 'express';
import customRolesController from './custom-roles.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de roles personalizados
router.get('/', customRolesController.getAllRoles);
router.get('/:id', customRolesController.getRoleById);
router.post('/', customRolesController.createRole);
router.put('/:id', customRolesController.updateRole);
router.delete('/:id', customRolesController.deleteRole);

// Gestión de permisos de roles
router.post('/:id/permissions', customRolesController.assignPermissions);

// Gestión de usuarios en roles
router.get('/:id/users', customRolesController.getRoleUsers);
router.post('/assign-user', customRolesController.assignRoleToUser);
router.delete('/remove-user', customRolesController.removeRoleFromUser);

export default router;
