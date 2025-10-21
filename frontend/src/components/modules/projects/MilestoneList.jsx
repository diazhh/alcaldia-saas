import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DELAYED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  DELAYED: 'Retrasado',
};

const statusIcons = {
  PENDING: Clock,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  DELAYED: AlertCircle,
};

/**
 * Componente para mostrar la lista de hitos de un proyecto
 * @param {Array} milestones - Lista de hitos
 * @param {Function} onUpdateProgress - Callback para actualizar progreso
 */
export default function MilestoneList({ milestones, onUpdateProgress }) {
  if (!milestones || milestones.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No hay hitos registrados para este proyecto
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone) => {
        const StatusIcon = statusIcons[milestone.status];
        const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== 'COMPLETED';

        return (
          <Card key={milestone.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <StatusIcon className={`h-5 w-5 mt-1 ${
                    milestone.status === 'COMPLETED' ? 'text-green-600' :
                    milestone.status === 'DELAYED' ? 'text-red-600' :
                    'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{milestone.name}</CardTitle>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={statusColors[milestone.status]}>
                  {statusLabels[milestone.status]}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Fecha límite: {format(new Date(milestone.dueDate), 'dd/MM/yyyy', { locale: es })}
                </span>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Vencido
                  </Badge>
                )}
                {milestone.completedAt && (
                  <span className="text-green-600">
                    Completado: {format(new Date(milestone.completedAt), 'dd/MM/yyyy', { locale: es })}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-semibold">{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} className="h-2" />
              </div>

              {milestone.status !== 'COMPLETED' && onUpdateProgress && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateProgress(milestone.id, Math.min(milestone.progress + 25, 100))}
                  >
                    +25%
                  </Button>
                  {milestone.progress === 100 && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onUpdateProgress(milestone.id, 100, true)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como Completado
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

MilestoneList.propTypes = {
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      dueDate: PropTypes.string.isRequired,
      completedAt: PropTypes.string,
      progress: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdateProgress: PropTypes.func,
};
