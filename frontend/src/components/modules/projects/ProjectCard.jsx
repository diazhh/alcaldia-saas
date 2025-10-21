import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Users, Eye } from 'lucide-react';
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

/**
 * Componente de tarjeta para mostrar información resumida de un proyecto
 * @param {Object} project - Datos del proyecto
 */
export default function ProjectCard({ project }) {
  const router = useRouter();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-mono">{project.code}</p>
            <h3 className="text-lg font-semibold mt-1 line-clamp-2">
              {project.name}
            </h3>
          </div>
          <Badge className={statusColors[project.status]}>
            {statusLabels[project.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 truncate">{project.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 truncate">
              {formatCurrency(project.budget)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {format(new Date(project.startDate), 'dd/MM/yyyy', { locale: es })}
            </span>
          </div>

          {project.beneficiaries && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {project.beneficiaries.toLocaleString()} beneficiarios
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Badge variant="outline" className="text-xs">
            {project.sector}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {project.category}
          </Badge>
          <Badge className={priorityColors[project.priority]} variant="outline">
            {project.priority}
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/proyectos/${project.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>
      </CardFooter>
    </Card>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    budget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    sector: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    beneficiaries: PropTypes.number,
  }).isRequired,
};
