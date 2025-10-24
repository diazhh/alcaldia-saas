/**
 * Asistente de Conciliación Bancaria
 * Permite crear y gestionar conciliaciones bancarias paso a paso
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
} from 'lucide-react';
import {
  useCreateBankReconciliation,
  useAddReconciliationItem,
  useReconcileItem,
  useCompleteBankReconciliation,
  useApproveBankReconciliation,
  useRejectBankReconciliation,
  useBankReconciliation,
} from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const ITEM_TYPES = {
  BANK_ONLY: { label: 'Solo en Banco', color: 'bg-blue-500' },
  BOOK_ONLY: { label: 'Solo en Libros', color: 'bg-purple-500' },
  IN_TRANSIT: { label: 'En Tránsito', color: 'bg-yellow-500' },
  ADJUSTMENT: { label: 'Ajuste', color: 'bg-orange-500' },
  ERROR: { label: 'Error', color: 'bg-red-500' },
  MATCHED: { label: 'Conciliado', color: 'bg-green-500' },
};

const STATUS_CONFIG = {
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-500', icon: Clock },
  COMPLETED: { label: 'Completada', color: 'bg-yellow-500', icon: CheckCircle },
  APPROVED: { label: 'Aprobada', color: 'bg-green-500', icon: CheckCircle },
  REJECTED: { label: 'Rechazada', color: 'bg-red-500', icon: XCircle },
};

export function BankReconciliationWizard({ bankAccount, reconciliationId, onClose }) {
  const [step, setStep] = useState(reconciliationId ? 2 : 1);
  const [reconciliationData, setReconciliationData] = useState({
    bankAccountId: bankAccount?.id || '',
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    statementBalance: '',
    statementDate: new Date().toISOString().slice(0, 10),
    attachmentUrl: '',
    notes: '',
  });
  const [newItem, setNewItem] = useState({
    type: 'BANK_ONLY',
    amount: '',
    description: '',
    reference: '',
  });
  const [currentReconciliationId, setCurrentReconciliationId] = useState(reconciliationId);

  const { data: reconciliation, isLoading } = useBankReconciliation(currentReconciliationId);
  const createMutation = useCreateBankReconciliation();
  const addItemMutation = useAddReconciliationItem();
  const reconcileItemMutation = useReconcileItem();
  const completeMutation = useCompleteBankReconciliation();
  const approveMutation = useApproveBankReconciliation();
  const rejectMutation = useRejectBankReconciliation();

  const handleCreateReconciliation = async () => {
    if (!reconciliationData.bankAccountId || !reconciliationData.statementBalance) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    const result = await createMutation.mutateAsync({
      ...reconciliationData,
      statementBalance: parseFloat(reconciliationData.statementBalance),
    });

    setCurrentReconciliationId(result.id);
    setStep(2);
  };

  const handleAddItem = async () => {
    if (!newItem.amount || !newItem.description) {
      toast.error('Complete todos los campos del ítem');
      return;
    }

    await addItemMutation.mutateAsync({
      reconciliationId: currentReconciliationId,
      ...newItem,
      amount: parseFloat(newItem.amount),
    });

    setNewItem({
      type: 'BANK_ONLY',
      amount: '',
      description: '',
      reference: '',
    });
  };

  const handleReconcileItem = async (itemId, transactionId) => {
    await reconcileItemMutation.mutateAsync({
      reconciliationId: currentReconciliationId,
      itemId,
      transactionId,
    });
  };

  const handleComplete = async () => {
    await completeMutation.mutateAsync(currentReconciliationId);
    setStep(3);
  };

  const handleApprove = async () => {
    await approveMutation.mutateAsync(currentReconciliationId);
    if (onClose) onClose();
  };

  const handleReject = async (reason) => {
    await rejectMutation.mutateAsync({
      id: currentReconciliationId,
      reason,
    });
    if (onClose) onClose();
  };

  if (isLoading && currentReconciliationId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            1
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            2
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            3
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {step === 1 && 'Paso 1: Datos Iniciales'}
          {step === 2 && 'Paso 2: Partidas de Conciliación'}
          {step === 3 && 'Paso 3: Revisión y Aprobación'}
        </div>
      </div>

      {/* Step 1: Initial Data */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Conciliación</CardTitle>
            <CardDescription>
              Ingrese los datos del estado de cuenta bancario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Input
                  id="period"
                  type="month"
                  value={reconciliationData.period}
                  onChange={(e) =>
                    setReconciliationData({ ...reconciliationData, period: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statementDate">Fecha del Estado de Cuenta</Label>
                <Input
                  id="statementDate"
                  type="date"
                  value={reconciliationData.statementDate}
                  onChange={(e) =>
                    setReconciliationData({ ...reconciliationData, statementDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statementBalance">Saldo según Estado de Cuenta *</Label>
              <Input
                id="statementBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={reconciliationData.statementBalance}
                onChange={(e) =>
                  setReconciliationData({
                    ...reconciliationData,
                    statementBalance: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentUrl">Adjunto (URL del estado de cuenta)</Label>
              <div className="flex space-x-2">
                <Input
                  id="attachmentUrl"
                  type="text"
                  placeholder="https://..."
                  value={reconciliationData.attachmentUrl}
                  onChange={(e) =>
                    setReconciliationData({ ...reconciliationData, attachmentUrl: e.target.value })
                  }
                />
                <Button variant="outline" size="icon">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales..."
                value={reconciliationData.notes}
                onChange={(e) =>
                  setReconciliationData({ ...reconciliationData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleCreateReconciliation} disabled={createMutation.isPending}>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Reconciliation Items */}
      {step === 2 && reconciliation && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Conciliación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Saldo Banco</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(reconciliation.statementBalance)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Saldo Libros</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(reconciliation.bookBalance)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Diferencia</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(reconciliation.difference)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estado</div>
                  <Badge className={STATUS_CONFIG[reconciliation.status].color}>
                    {STATUS_CONFIG[reconciliation.status].label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Item Card */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Partida de Conciliación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newItem.type} onValueChange={(value) => setNewItem({ ...newItem, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ITEM_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referencia</Label>
                  <Input
                    placeholder="Ref..."
                    value={newItem.reference}
                    onChange={(e) => setNewItem({ ...newItem, reference: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input
                    placeholder="Descripción..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddItem} disabled={addItemMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Partida
              </Button>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Partidas de Conciliación</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliation.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge className={ITEM_TYPES[item.type].color}>
                          {ITEM_TYPES[item.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.reference || '-'}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        {item.isReconciled ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Conciliado
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!reconciliation.items || reconciliation.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No hay partidas agregadas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Guardar y Salir
              </Button>
              <Button onClick={handleComplete} disabled={completeMutation.isPending}>
                Completar Conciliación
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review and Approval */}
      {step === 3 && reconciliation && (
        <Card>
          <CardHeader>
            <CardTitle>Revisión Final</CardTitle>
            <CardDescription>
              Revise los datos de la conciliación antes de aprobar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Período</div>
                <div className="font-medium">{reconciliation.period}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Fecha</div>
                <div className="font-medium">{formatDate(reconciliation.statementDate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Saldo Banco</div>
                <div className="font-medium">{formatCurrency(reconciliation.statementBalance)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Saldo Libros</div>
                <div className="font-medium">{formatCurrency(reconciliation.bookBalance)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Diferencia</div>
                <div className={`font-medium ${reconciliation.difference !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(reconciliation.difference)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Partidas</div>
                <div className="font-medium">{reconciliation.items?.length || 0}</div>
              </div>
            </div>

            {reconciliation.difference !== 0 && (
              <div className="flex items-start space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-900">Advertencia</div>
                  <div className="text-sm text-yellow-700">
                    Existe una diferencia de {formatCurrency(Math.abs(reconciliation.difference))}.
                    Verifique las partidas antes de aprobar.
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Editar
              </Button>
              <div className="space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt('Ingrese la razón del rechazo:');
                    if (reason) handleReject(reason);
                  }}
                >
                  Rechazar
                </Button>
                <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar Conciliación
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
