import { 
  getRecentAccessDenied, 
  getAccessDeniedStats,
  clearAccessDeniedLog 
} from '../../../shared/utils/access-logger.js';
import { 
  getAccessibleModules, 
  getModulePermissions,
  MODULES,
  ACTIONS,
  ROLES 
} from '../../../shared/constants/permissions.js';

/**
 * Controlador de Seguridad y Auditoría
 */
class SecurityController {
  /**
   * Obtener logs de accesos denegados
   * @route GET /api/admin/security/access-denied
   */
  async getAccessDeniedLogs(req, res, next) {
    try {
      const { limit = 100 } = req.query;
      
      const logs = await getRecentAccessDenied(parseInt(limit));
      
      res.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de accesos denegados
   * @route GET /api/admin/security/access-denied/stats
   */
  async getAccessDeniedStatistics(req, res, next) {
    try {
      const stats = await getAccessDeniedStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Limpiar logs de accesos denegados
   * @route DELETE /api/admin/security/access-denied
   */
  async clearAccessDeniedLogs(req, res, next) {
    try {
      await clearAccessDeniedLog();
      
      res.json({
        success: true,
        message: 'Logs de accesos denegados limpiados exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener matriz de permisos completa
   * @route GET /api/admin/security/permissions
   */
  async getPermissionsMatrix(req, res, next) {
    try {
      res.json({
        success: true,
        data: {
          modules: MODULES,
          actions: ACTIONS,
          roles: ROLES,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener permisos de un rol específico
   * @route GET /api/admin/security/permissions/:role
   */
  async getRolePermissions(req, res, next) {
    try {
      const { role } = req.params;
      
      // Validar que el rol existe
      if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido',
        });
      }
      
      const accessibleModules = getAccessibleModules(role);
      
      const permissions = {};
      accessibleModules.forEach(module => {
        permissions[module] = getModulePermissions(role, module);
      });
      
      res.json({
        success: true,
        data: {
          role,
          accessibleModules,
          permissions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener permisos del usuario actual
   * @route GET /api/admin/security/my-permissions
   */
  async getMyPermissions(req, res, next) {
    try {
      const { role } = req.user;
      
      const accessibleModules = getAccessibleModules(role);
      
      const permissions = {};
      accessibleModules.forEach(module => {
        permissions[module] = getModulePermissions(role, module);
      });
      
      res.json({
        success: true,
        data: {
          role,
          accessibleModules,
          permissions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SecurityController();
