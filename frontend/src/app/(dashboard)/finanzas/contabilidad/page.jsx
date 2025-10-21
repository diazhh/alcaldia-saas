/**
 * Página de Contabilidad
 * Visualización de libros contables y asientos
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Calculator } from 'lucide-react';
import { useGeneralJournal, useTrialBalance } from '@/hooks/useFinance';

export default function ContabilidadPage() {
  const { data: journal, isLoading: journalLoading } = useGeneralJournal();
  const { data: trialBalance, isLoading: balanceLoading } = useTrialBalance(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contabilidad</h1>
          <p className="text-muted-foreground">
            Libros contables y registros según el Plan de Cuentas Nacional
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="journal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journal">Libro Diario</TabsTrigger>
          <TabsTrigger value="ledger">Libro Mayor</TabsTrigger>
          <TabsTrigger value="trial">Balance de Comprobación</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>Libro Diario</CardTitle>
              </div>
              <CardDescription>
                Registro cronológico de todos los asientos contables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Visualización del libro diario próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Libro Mayor</CardTitle>
              </div>
              <CardDescription>
                Movimientos agrupados por cuenta contable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Visualización del libro mayor próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <CardTitle>Balance de Comprobación</CardTitle>
              </div>
              <CardDescription>
                Resumen de saldos de todas las cuentas contables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Visualización del balance de comprobación próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
