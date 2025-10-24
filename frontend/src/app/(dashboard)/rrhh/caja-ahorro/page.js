'use client';

import { useState } from 'react';
import { PiggyBank, TrendingUp, DollarSign, Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSavingsBankStats, useSavingsBankAccounts } from '@/hooks/hr/useSavingsBank';
import { Skeleton } from '@/components/ui/skeleton';
import SavingsBankAccountsTable from '@/components/modules/hr/SavingsBankAccountsTable';
import SavingsLoansTable from '@/components/modules/hr/SavingsLoansTable';
import CreateSavingsBankAccountDialog from '@/components/modules/hr/CreateSavingsBankAccountDialog';
import CreateLoanRequestDialog from '@/components/modules/hr/CreateLoanRequestDialog';

/**
 * Página de gestión de Caja de Ahorro
 */
export default function CajaAhorroPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateLoan, setShowCreateLoan] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
  });

  const { data: stats, isLoading: statsLoading } = useSavingsBankStats();
  const { data: accountsData, isLoading: accountsLoading } = useSavingsBankAccounts(filters);

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Caja de Ahorro</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de cuentas de ahorro y préstamos del personal
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateLoan(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Solicitar Préstamo
          </Button>
          <Button onClick={() => setShowCreateAccount(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Cuentas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalAccounts || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                Bs. {stats?.totalBalance?.toLocaleString('es-VE', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Préstamos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats?.activeLoans || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Prestado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">
                Bs. {stats?.totalLoaned?.toLocaleString('es-VE', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Cuentas de Ahorro</TabsTrigger>
          <TabsTrigger value="loans">Préstamos</TabsTrigger>
          <TabsTrigger value="contributions">Aportes Mensuales</TabsTrigger>
        </TabsList>

        {/* Cuentas de Ahorro */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por empleado..."
                      value={filters.search}
                      onChange={handleSearch}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <SavingsBankAccountsTable
                data={accountsData?.data || []}
                pagination={accountsData?.pagination}
                isLoading={accountsLoading}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Préstamos */}
        <TabsContent value="loans" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <SavingsLoansTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aportes Mensuales */}
        <TabsContent value="contributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aportes Mensuales</CardTitle>
              <CardDescription>
                Historial de aportes de empleados y patronales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Funcionalidad en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateSavingsBankAccountDialog
        open={showCreateAccount}
        onOpenChange={setShowCreateAccount}
      />
      <CreateLoanRequestDialog
        open={showCreateLoan}
        onOpenChange={setShowCreateLoan}
      />
    </div>
  );
}
