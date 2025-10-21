import departmentService from './department.service.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  listDepartmentsQuerySchema,
} from './department.validation.js';

/**
 * Controlador para gestión de departamentos
 */
class DepartmentController {
  /**
   * Crear un nuevo departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async create(req, res, next) {
    try {
      // Validar datos
      const validatedData = createDepartmentSchema.parse(req.body);

      // Crear departamento
      const department = await departmentService.createDepartment(validatedData);

      res.status(201).json({
        success: true,
        message: 'Departamento creado exitosamente',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar departamentos
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async list(req, res, next) {
    try {
      // Validar query params
      const filters = listDepartmentsQuerySchema.parse(req.query);

      // Obtener departamentos
      const result = await departmentService.listDepartments(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener árbol jerárquico de departamentos
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getTree(req, res, next) {
    try {
      const tree = await departmentService.getDepartmentTree();

      res.json({
        success: true,
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener un departamento por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const department = await departmentService.getDepartmentById(id);

      res.json({
        success: true,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateDepartmentSchema.parse(req.body);

      const department = await departmentService.updateDepartment(id, validatedData);

      res.json({
        success: true,
        message: 'Departamento actualizado exitosamente',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await departmentService.deleteDepartment(id);

      res.json({
        success: true,
        message: 'Departamento eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener ancestros de un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getAncestors(req, res, next) {
    try {
      const { id } = req.params;
      const ancestors = await departmentService.getAncestors(id);

      res.json({
        success: true,
        data: ancestors,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener descendientes de un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getDescendants(req, res, next) {
    try {
      const { id } = req.params;
      const descendants = await departmentService.getDescendants(id);

      res.json({
        success: true,
        data: descendants,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener path completo de un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getPath(req, res, next) {
    try {
      const { id } = req.params;
      const path = await departmentService.getDepartmentPath(id);

      res.json({
        success: true,
        data: path,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de jerarquía de un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getHierarchyStats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await departmentService.getHierarchyStats(id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentController();
