'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, Vote, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BudgetList from '@/components/modules/participation/BudgetList';
import { listParticipatoryBudgets } from '@/services/participation.service';

/**
 * Página principal de presupuesto participativo
 */
export default function PresupuestoParticipativoPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar convocatorias
   */
  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await listParticipatoryBudgets({ limit: 100 });
      setBudgets(response.data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Presupuesto Participativo</h1>
            <p className="text-xl text-green-100">
              Participa en las decisiones sobre cómo invertir los recursos de tu comunidad
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Información */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Propón</CardTitle>
                  <CardDescription>Tus ideas</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Presenta proyectos que beneficien a tu comunidad. Pueden ser obras,
                  programas sociales, mejoras urbanas, etc.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Vote className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Vota</CardTitle>
                  <CardDescription>Por los proyectos</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Elige los proyectos que consideres más importantes para tu sector.
                  Tu voto cuenta.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Seguimiento</CardTitle>
                  <CardDescription>De la ejecución</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Monitorea el avance de los proyectos ganadores y verifica que se
                  ejecuten correctamente.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Convocatorias activas */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Convocatorias</h2>
            <BudgetList budgets={budgets} loading={loading} />
          </div>

          {/* Información adicional */}
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              ¿Qué es el Presupuesto Participativo?
            </h3>
            <p className="text-sm text-green-800 mb-4">
              Es un mecanismo democrático que permite a los ciudadanos decidir directamente
              sobre una parte del presupuesto municipal. A través de este proceso, la
              comunidad puede proponer, debatir y votar por proyectos que mejoren su
              calidad de vida.
            </p>
            <h3 className="font-semibold text-green-900 mb-2">¿Cómo funciona?</h3>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>
                <strong>Convocatoria:</strong> La alcaldía abre el proceso y define el
                presupuesto disponible
              </li>
              <li>
                <strong>Propuestas:</strong> Los ciudadanos presentan proyectos para su
                comunidad
              </li>
              <li>
                <strong>Evaluación:</strong> Técnicos municipales verifican la viabilidad
                de cada propuesta
              </li>
              <li>
                <strong>Votación:</strong> La comunidad vota por los proyectos que
                considera prioritarios
              </li>
              <li>
                <strong>Ejecución:</strong> Los proyectos ganadores se ejecutan y la
                comunidad hace seguimiento
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
