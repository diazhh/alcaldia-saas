'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProject, useMilestones, useExpenses, useExpenseStats, usePhotos } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import MilestoneList from '@/components/modules/projects/MilestoneList';
import ExpenseList from '@/components/modules/projects/ExpenseList';
import ContractList from '@/components/modules/projects/ContractList';
import InspectionList from '@/components/modules/projects/InspectionList';
import ChangeOrderList from '@/components/modules/projects/ChangeOrderList';
import ProgressReportList from '@/components/modules/projects/ProgressReportList';
import DocumentList from '@/components/modules/projects/DocumentList';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Tag,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  CheckSquare,
  GitPullRequest,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors = {
  PLANNING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  PAUSED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  PAUSED: 'Pausado',
  CANCELLED: 'Cancelado',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id;

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: milestones, isLoading: milestonesLoading } = useMilestones(projectId);
  const { data: expenses, isLoading: expensesLoading } = useExpenses(projectId);
  const { data: expenseStats } = useExpenseStats(projectId);
  const { data: photos, isLoading: photosLoading } = usePhotos(projectId);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateBudgetUsage = () => {
    if (!project || !expenseStats) return 0;
    const budget = parseFloat(project.budget);
    const spent = parseFloat(expenseStats.total);
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  if (projectError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error al cargar el proyecto: {projectError.message}</p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/proyectos')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Proyectos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const budgetUsage = calculateBudgetUsage();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/proyectos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-sm text-gray-500 font-mono">{project.code}</p>
            <h1 className="text-3xl font-bold mt-1">{project.name}</h1>
            <div className="flex gap-2 mt-2">
              <Badge className={statusColors[project.status]}>
                {statusLabels[project.status]}
              </Badge>
              <Badge className={priorityColors[project.priority]}>
                Prioridad: {priorityLabels[project.priority]}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/proyectos/${projectId}/editar`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Proyecto
        </Button>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(project.budget)}</p>
            {expenseStats && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Ejecutado</span>
                  <span>{budgetUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budgetUsage > 100 ? 'bg-red-600' :
                      budgetUsage > 80 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formatCurrency(expenseStats.total)} gastado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div>
                <p className="text-xs text-gray-500">Inicio</p>
                <p className="font-semibold">
                  {format(new Date(project.startDate), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fin</p>
                <p className="font-semibold">
                  {format(new Date(project.endDate), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{project.location}</p>
            {project.latitude && project.longitude && (
              <p className="text-xs text-gray-500 mt-1">
                {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Beneficiarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {project.beneficiaries ? project.beneficiaries.toLocaleString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">personas</p>
          </CardContent>
        </Card>
      </div>

      {/* Descripción y Detalles */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{project.description || 'Sin descripción'}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Sector</p>
                <p className="font-semibold">{project.sector}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Categoría</p>
                <p className="font-semibold">{project.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Responsable</p>
                <p className="font-semibold">
                  {project.manager ? 
                    `${project.manager.firstName} ${project.manager.lastName}` : 
                    'No asignado'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con toda la información del proyecto */}
      <Tabs defaultValue="milestones" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8 lg:w-auto">
          <TabsTrigger value="milestones">
            <CheckSquare className="h-4 w-4 mr-2" />
            Hitos
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <DollarSign className="h-4 w-4 mr-2" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <Briefcase className="h-4 w-4 mr-2" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="inspections">
            <CheckSquare className="h-4 w-4 mr-2" />
            Inspecciones
          </TabsTrigger>
          <TabsTrigger value="changeOrders">
            <GitPullRequest className="h-4 w-4 mr-2" />
            Cambios
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Avances
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="photos">
            <ImageIcon className="h-4 w-4 mr-2" />
            Fotos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Hitos del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              {milestonesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <MilestoneList milestones={milestones} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Gastos del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ExpenseList expenses={expenses} stats={expenseStats} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractList projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle>Inspecciones de Calidad</CardTitle>
            </CardHeader>
            <CardContent>
              <InspectionList projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changeOrders">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes de Cambio</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangeOrderList projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Avance</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressReportList projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Fotos del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              {photosLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : photos && photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id}>
                      <CardContent className="p-4">
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto del proyecto'}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {photo.caption && (
                          <p className="text-sm text-gray-600 mt-2">{photo.caption}</p>
                        )}
                        <Badge variant="outline" className="mt-2">
                          {photo.type}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No hay fotos registradas para este proyecto
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
