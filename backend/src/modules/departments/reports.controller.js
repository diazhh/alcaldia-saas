import reportsService from './reports.service.js';

/**
 * Controlador para reportes y estadísticas de estructura organizacional
 */
class DepartmentReportsController {
  /**
   * Obtener empleados por departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getEmployeesByDepartment(req, res, next) {
    try {
      const { departmentId } = req.query;

      const report = await reportsService.getEmployeesByDepartment(departmentId);

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener departamentos sin jefe
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getDepartmentsWithoutHead(req, res, next) {
    try {
      const departments = await reportsService.getDepartmentsWithoutHead();

      res.json({
        success: true,
        data: departments,
        count: departments.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuarios sin departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getUsersWithoutDepartment(req, res, next) {
    try {
      const users = await reportsService.getUsersWithoutDepartment();

      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener distribución de personal por nivel
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getStaffDistribution(req, res, next) {
    try {
      const distribution = await reportsService.getStaffDistributionByLevel();

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener datos para organigrama
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getOrgChartData(req, res, next) {
    try {
      const { rootDepartmentId } = req.query;

      const orgChart = await reportsService.getOrgChartData(rootDepartmentId);

      res.json({
        success: true,
        data: orgChart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas generales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getGeneralStats(req, res, next) {
    try {
      const stats = await reportsService.getGeneralStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener directorio telefónico
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getPhoneDirectory(req, res, next) {
    try {
      const { departmentId } = req.query;

      const directory = await reportsService.getPhoneDirectory(departmentId);

      res.json({
        success: true,
        data: directory,
        count: directory.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentReportsController();
