/**
 * Página de Tesorería
 * Gestión de cuentas bancarias, ingresos y pagos
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useBankAccounts, usePayments, useIncomes } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';
import { CreateBankAccountDialog } from '@/components/modules/finance/CreateBankAccountDialog';
import { CreateIncomeDialog } from '@/components/modules/finance/CreateIncomeDialog';

export default function TesoreriaPage() {
  const { data: bankAccounts, isLoading: accountsLoading } = useBankAccounts();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: incomes, isLoading: incomesLoading } = useIncomes();

  const totalBalance = bankAccounts?.reduce(
    (sum, account) => sum + parseFloat(account.balance),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
          <p className="text-muted-foreground">
            Gestión de cuentas bancarias, ingresos y pagos municipales
          </p>
        </div>
      </div>

      {/* Resumen de Cuentas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              En {bankAccounts?.length || 0} cuentas bancarias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                incomes?.incomes?.reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {incomes?.incomes?.length || 0} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments?.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments?.payments?.length || 0} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Cuentas Bancarias</TabsTrigger>
          <TabsTrigger value="incomes">Ingresos</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cuentas Bancarias</CardTitle>
                  <CardDescription>
                    Gestión de cuentas bancarias del municipio
                  </CardDescription>
                </div>
                <CreateBankAccountDialog>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Cuenta
                  </Button>
                </CreateBankAccountDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankAccounts?.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{account.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.accountNumber} • {account.accountType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(account.balance)}
                      </p>
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ingresos</CardTitle>
                  <CardDescription>
                    Registro de ingresos municipales
                  </CardDescription>
                </div>
                <CreateIncomeDialog>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Ingreso
                  </Button>
                </CreateIncomeDialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Listado de ingresos próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pagos</CardTitle>
                  <CardDescription>
                    Registro de pagos realizados
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Pago
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Listado de pagos próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
