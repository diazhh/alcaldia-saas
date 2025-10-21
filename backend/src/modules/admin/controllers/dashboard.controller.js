/**
 * Controlador para Dashboard Principal
 */

import prisma from '../../../config/database.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Obtiene estadísticas principales del dashboard
 * @route GET /api/admin/dashboard/stats
 */
export async function getDashboardStats(req, res) {
  try {
    // Contar proyectos activos
    const activeProjects = await prisma.project.count({
      where: {
        status: {
          in: ['PLANNING', 'IN_PROGRESS']
        }
      }
    });

    // Calcular presupuesto ejecutado (del año actual)
    const currentYear = new Date().getFullYear();
    const budgets = await prisma.budget.findMany({
      where: {
        year: currentYear
      },
      select: {
        totalAmount: true,
        executedAmount: true
      }
    });

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const executedBudget = budgets.reduce((sum, b) => sum + Number(b.executedAmount || 0), 0);
    const budgetPercentage = totalBudget > 0 ? Math.round((executedBudget / totalBudget) * 100) : 0;

    // Contar empleados activos
    const activeEmployees = await prisma.employee.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Contar solicitudes pendientes (vacaciones + permisos)
    const pendingVacations = await prisma.vacationRequest.count({
      where: {
        status: 'PENDING'
      }
    });

    const pendingLeaves = await prisma.leave.count({
      where: {
        status: 'PENDING'
      }
    });

    const pendingRequests = pendingVacations + pendingLeaves;

    // Proyectos recientes (últimos 5)
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        status: true,
        budget: true,
        executedBudget: true
      }
    });

    // Calcular porcentaje de cada proyecto
    const projectsWithPercentage = recentProjects.map(project => ({
      ...project,
      percentage: project.budget > 0
        ? Math.round((Number(project.executedBudget || 0) / Number(project.budget)) * 100)
        : 0
    }));

    // Actividad reciente (últimas acciones del sistema)
    // Por ahora, últimos proyectos creados como actividad
    const recentActivity = await prisma.project.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    const activityFormatted = recentActivity.map(activity => ({
      id: activity.id,
      title: `Proyecto "${activity.name}" creado`,
      timestamp: activity.createdAt,
      timeAgo: getTimeAgo(activity.createdAt)
    }));

    return successResponse(res, {
      stats: {
        activeProjects,
        budgetPercentage,
        activeEmployees,
        pendingRequests
      },
      recentProjects: projectsWithPercentage,
      recentActivity: activityFormatted
    });

  } catch (error) {
    console.error('Error al obtener stats del dashboard:', error);
    return errorResponse(res, 'Error al obtener estadísticas', 500);
  }
}

/**
 * Función helper para calcular tiempo transcurrido
 */
function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000); // diferencia en segundos

  if (diff < 60) return 'Hace menos de 1 minuto';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minuto(s)`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora(s)`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} día(s)`;
  return `Hace ${Math.floor(diff / 604800)} semana(s)`;
}
