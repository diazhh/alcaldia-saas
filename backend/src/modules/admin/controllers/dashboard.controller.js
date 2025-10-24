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
    console.log('📊 Fetching dashboard stats...');
    
    // Contar proyectos activos
    const activeProjects = await prisma.project.count({
      where: {
        status: {
          in: ['PLANNING', 'IN_PROGRESS']
        }
      }
    });
    console.log('✅ Active projects:', activeProjects);

    // Calcular presupuesto ejecutado (del año actual)
    const currentYear = new Date().getFullYear();
    console.log('📅 Current year:', currentYear);
    
    const budget = await prisma.budget.findUnique({
      where: {
        year: currentYear
      },
      include: {
        items: {
          select: {
            allocatedAmount: true,
            paidAmount: true
          }
        }
      }
    });
    console.log('💰 Budget found:', budget ? 'Yes' : 'No');

    let totalBudget = 0;
    let executedBudget = 0;
    let budgetPercentage = 0;

    if (budget) {
      totalBudget = budget.items.reduce((sum, item) => sum + Number(item.allocatedAmount), 0);
      executedBudget = budget.items.reduce((sum, item) => sum + Number(item.paidAmount), 0);
      budgetPercentage = totalBudget > 0 ? Math.round((executedBudget / totalBudget) * 100) : 0;
    }

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
        expenses: {
          select: {
            amount: true
          }
        }
      }
    });

    // Calcular porcentaje de cada proyecto
    const projectsWithPercentage = recentProjects.map(project => {
      const executedBudget = project.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        budget: Number(project.budget),
        executedBudget,
        percentage: Number(project.budget) > 0
          ? Math.round((executedBudget / Number(project.budget)) * 100)
          : 0
      };
    });

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
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
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
