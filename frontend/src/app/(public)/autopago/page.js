'use client';

import { useState } from 'react';
import { Search, FileText, CreditCard, Download, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';

/**
 * Portal Público de Autopago
 * Permite a los ciudadanos consultar deudas y realizar pagos en línea
 */
export default function AutopagoPage() {
  const [taxId, setTaxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [debts, setDebts] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('search'); // search, debts, payment, success

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tax/payments/debts/${taxId}`
      );
      setDebts(response.data);
      setStep('debts');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al consultar deudas');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlip = async (selectedBills) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tax/payments/generate-slip`,
        { billIds: selectedBills }
      );
      // Aquí se podría descargar la planilla o mostrar el código de pago
      alert(`Código de pago generado: ${response.data.paymentCode}`);
      setStep('payment');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar planilla');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Portal de Autopago Municipal
          </h1>
          <p className="text-lg text-gray-600">
            Consulta tus deudas y realiza pagos en línea de forma rápida y segura
          </p>
        </div>

        {/* Search Form */}
        {step === 'search' && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Consultar Deudas
              </CardTitle>
              <CardDescription>
                Ingresa tu RIF o Cédula de Identidad para consultar tus deudas tributarias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="taxId">RIF / Cédula de Identidad</Label>
                  <Input
                    id="taxId"
                    placeholder="Ej: V-12345678 o J-123456789"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Formato: V-12345678 para personas naturales o J-123456789 para jurídicas
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Consultando...' : 'Consultar Deudas'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Debts List */}
        {step === 'debts' && debts && (
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Estado de Cuenta</CardTitle>
                    <CardDescription>
                      Contribuyente: {debts.taxpayer?.name}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setStep('search')}>
                    Nueva Consulta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {debts.bills && debts.bills.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Total Adeudado</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(debts.totalDebt)}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {debts.bills.length} {debts.bills.length === 1 ? 'Factura' : 'Facturas'}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {debts.bills.map((bill) => (
                        <div
                          key={bill.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <p className="font-medium">{bill.concept}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Factura N° {bill.billNumber} - Vence: {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(bill.amount)}</p>
                            {bill.status === 'OVERDUE' && (
                              <Badge variant="destructive" className="mt-1">Vencida</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleGenerateSlip(debts.bills.map(b => b.id))}
                      disabled={loading}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {loading ? 'Generando...' : 'Generar Planilla de Pago'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      ¡Estás al día!
                    </h3>
                    <p className="text-gray-600">
                      No tienes deudas pendientes con la alcaldía
                    </p>
                    <Button className="mt-4" onClick={() => setStep('search')}>
                      Realizar Nueva Consulta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Info */}
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pago Móvil</p>
                      <p className="text-sm text-gray-600">
                        Transferencia C2P desde tu banco
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Transferencia Bancaria</p>
                      <p className="text-sm text-gray-600">
                        A las cuentas municipales
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Punto de Venta</p>
                      <p className="text-sm text-gray-600">
                        En taquillas municipales
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Bancos Autorizados</p>
                      <p className="text-sm text-gray-600">
                        En agencias y corresponsales
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
