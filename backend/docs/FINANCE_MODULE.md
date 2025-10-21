# Módulo de Finanzas - Documentación

## Resumen

El módulo de finanzas implementa un sistema completo de gestión financiera y presupuestaria para alcaldías venezolanas, cumpliendo con la normativa ONAPRE.

## Características Implementadas

### 1. Gestión de Presupuesto
- ✅ Creación de presupuesto anual
- ✅ Distribución por partidas presupuestarias (clasificador ONAPRE)
- ✅ Modificaciones presupuestarias (créditos adicionales, traspasos, rectificaciones)
- ✅ Flujo de aprobación (DRAFT → SUBMITTED → APPROVED → ACTIVE → CLOSED)
- ✅ Estadísticas de ejecución presupuestaria

### 2. Control de Disponibilidad Presupuestaria
- ✅ Validación en tiempo real de disponibilidad
- ✅ Prevención de gastos que excedan el presupuesto
- ✅ Cálculo automático de montos disponibles

### 3. Ciclo del Gasto (Compromiso, Causado, Pagado)
- ✅ **COMPROMISO**: Reserva de presupuesto al firmar contrato/orden de compra
- ✅ **CAUSADO**: Generación de cuenta por pagar al recibir bien/servicio
- ✅ **PAGADO**: Descarga de tesorería al efectuar el pago
- ✅ Validaciones de transiciones de estado
- ✅ Actualización automática de partidas presupuestarias

### 4. Tesorería
- ✅ Gestión de cuentas bancarias (corriente, ahorro, especial)
- ✅ Registro de ingresos (situado, tributos, transferencias, multas, tasas)
- ✅ Gestión de pagos (transferencia, cheque, efectivo, domiciliación)
- ✅ Control de saldos bancarios
- ✅ Flujo de caja (ingresos vs egresos)

## Estructura de Base de Datos

### Modelos Principales

#### Budget (Presupuesto)
```prisma
- id: UUID
- year: Int (único)
- totalAmount: Decimal
- estimatedIncome: Decimal
- status: BudgetStatus
- approvedBy: String
- approvedAt: DateTime
```

#### BudgetItem (Partida Presupuestaria)
```prisma
- id: UUID
- budgetId: String
- code: String (código ONAPRE)
- name: String
- allocatedAmount: Decimal (asignado)
- committedAmount: Decimal (comprometido)
- accruedAmount: Decimal (causado)
- paidAmount: Decimal (pagado)
- availableAmount: Decimal (disponible)
```

#### Transaction (Transacción)
```prisma
- id: UUID
- reference: String (único)
- type: TransactionType
- status: ExpenseStatus (COMPROMISO, CAUSADO, PAGADO, ANULADO)
- amount: Decimal
- budgetItemId: String
- concept: String
- beneficiary: String
- committedAt, accruedAt, paidAt: DateTime
```

#### BankAccount (Cuenta Bancaria)
```prisma
- id: UUID
- bankName: String
- accountNumber: String (único)
- accountType: AccountType
- balance: Decimal
- currency: String
```

#### Payment (Pago)
```prisma
- id: UUID
- reference: String (único)
- amount: Decimal
- paymentMethod: PaymentMethod
- beneficiary: String
- status: PaymentStatus
- paymentDate: DateTime
```

#### Income (Ingreso)
```prisma
- id: UUID
- reference: String (único)
- type: IncomeType
- amount: Decimal
- bankAccountId: String
- source: String
- incomeDate: DateTime
```

## API Endpoints

### Presupuestos

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/finance/budgets` | Listar presupuestos | ADMIN, DIRECTOR, COORDINADOR |
| GET | `/api/finance/budgets/year/:year` | Obtener por año | Todos |
| GET | `/api/finance/budgets/:id` | Obtener por ID | Todos |
| GET | `/api/finance/budgets/:id/stats` | Estadísticas de ejecución | Todos |
| POST | `/api/finance/budgets` | Crear presupuesto | ADMIN, DIRECTOR |
| PUT | `/api/finance/budgets/:id` | Actualizar presupuesto | ADMIN, DIRECTOR |
| POST | `/api/finance/budgets/:id/approve` | Aprobar presupuesto | ADMIN |
| POST | `/api/finance/budgets/:id/activate` | Activar presupuesto | ADMIN |
| POST | `/api/finance/budgets/:id/close` | Cerrar presupuesto | ADMIN |
| DELETE | `/api/finance/budgets/:id` | Eliminar presupuesto | SUPER_ADMIN, ADMIN |

### Partidas Presupuestarias

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/finance/budgets/:budgetId/items` | Listar partidas | Todos |
| GET | `/api/finance/budgets/:budgetId/items/by-category` | Resumen por categoría | Todos |
| GET | `/api/finance/budget-items/:id` | Obtener por ID | Todos |
| POST | `/api/finance/budget-items` | Crear partida | ADMIN, DIRECTOR |
| POST | `/api/finance/budget-items/check-availability` | Verificar disponibilidad | Todos |
| PUT | `/api/finance/budget-items/:id` | Actualizar partida | ADMIN, DIRECTOR |
| DELETE | `/api/finance/budget-items/:id` | Eliminar partida | SUPER_ADMIN, ADMIN |

### Transacciones

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/finance/transactions` | Listar transacciones | Todos |
| GET | `/api/finance/transactions/stats` | Estadísticas | ADMIN, DIRECTOR, COORDINADOR |
| GET | `/api/finance/transactions/:id` | Obtener por ID | Todos |
| POST | `/api/finance/transactions` | Crear (COMPROMISO) | ADMIN, DIRECTOR, COORDINADOR |
| POST | `/api/finance/transactions/:id/accrue` | Causar transacción | ADMIN, DIRECTOR, COORDINADOR |
| POST | `/api/finance/transactions/:id/pay` | Pagar transacción | ADMIN, DIRECTOR |
| POST | `/api/finance/transactions/:id/cancel` | Anular transacción | ADMIN |

### Cuentas Bancarias

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/finance/bank-accounts` | Listar cuentas | ADMIN, DIRECTOR, COORDINADOR |
| GET | `/api/finance/bank-accounts/:id` | Obtener por ID | ADMIN, DIRECTOR, COORDINADOR |
| POST | `/api/finance/bank-accounts` | Crear cuenta | ADMIN, DIRECTOR |
| PUT | `/api/finance/bank-accounts/:id` | Actualizar cuenta | ADMIN, DIRECTOR |

### Pagos

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/finance/payments` | Listar pagos | ADMIN, DIRECTOR, COORDINADOR |
| GET | `/api/finance/payments/:id` | Obtener por ID | ADMIN, DIRECTOR, COORDINADOR |
| POST | `/api/finance/payments` | Crear pago | ADMIN, DIRECTOR, COORDINADOR |
| PATCH | `/api/finance/payments/:id/status` | Actualizar estado | ADMIN, DIRECTOR |

### Ingresos

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/finance/incomes` | Listar ingresos | ADMIN, DIRECTOR, COORDINADOR |
| GET | `/api/finance/incomes/:id` | Obtener por ID | ADMIN, DIRECTOR, COORDINADOR |
| POST | `/api/finance/incomes` | Registrar ingreso | ADMIN, DIRECTOR, COORDINADOR |

### Flujo de Caja

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/finance/cash-flow` | Obtener flujo de caja | ADMIN, DIRECTOR, COORDINADOR |

## Flujo de Trabajo Típico

### 1. Creación del Presupuesto Anual
```javascript
POST /api/finance/budgets
{
  "year": 2025,
  "totalAmount": 50000000,
  "estimatedIncome": 50000000,
  "notes": "Presupuesto municipal 2025"
}
```

### 2. Agregar Partidas Presupuestarias
```javascript
POST /api/finance/budget-items
{
  "budgetId": "uuid",
  "code": "4.01.01.02",
  "name": "Gastos de Personal",
  "allocatedAmount": 10000000,
  "category": "Gastos Corrientes"
}
```

### 3. Aprobar y Activar Presupuesto
```javascript
POST /api/finance/budgets/:id/approve
POST /api/finance/budgets/:id/activate
```

### 4. Crear Transacción (Compromiso)
```javascript
POST /api/finance/transactions
{
  "type": "GASTO",
  "amount": 50000,
  "budgetItemId": "uuid",
  "concept": "Compra de equipos",
  "beneficiary": "Proveedor XYZ",
  "invoiceNumber": "INV-001"
}
// Sistema valida disponibilidad y reserva presupuesto
```

### 5. Causar Transacción
```javascript
POST /api/finance/transactions/:id/accrue
// Al recibir el bien/servicio
```

### 6. Crear Pago
```javascript
POST /api/finance/payments
{
  "amount": 50000,
  "paymentMethod": "TRANSFERENCIA",
  "bankAccountId": "uuid",
  "beneficiary": "Proveedor XYZ",
  "concept": "Pago factura INV-001",
  "paymentDate": "2025-10-11"
}
```

### 7. Pagar Transacción
```javascript
POST /api/finance/transactions/:id/pay
{
  "paymentId": "uuid"
}
// Descarga de tesorería
```

## Validaciones Implementadas

### Control de Disponibilidad
- ✅ No se puede comprometer un gasto sin disponibilidad presupuestaria
- ✅ El monto disponible se calcula automáticamente: `disponible = asignado - comprometido`
- ✅ Solo se pueden ejecutar gastos en presupuestos ACTIVOS

### Transiciones de Estado
- ✅ COMPROMISO → CAUSADO ✓
- ✅ COMPROMISO → ANULADO ✓
- ✅ CAUSADO → PAGADO ✓
- ✅ CAUSADO → ANULADO ✓
- ✅ PAGADO → (final) ✗
- ✅ ANULADO → (final) ✗

### Integridad de Datos
- ✅ No se puede eliminar un presupuesto con transacciones
- ✅ No se puede eliminar una partida con transacciones
- ✅ No se puede modificar un presupuesto cerrado
- ✅ Los saldos bancarios no pueden ser negativos

## Próximos Pasos

### Pendientes de Implementación
- ⏳ Sistema contable (asientos automáticos)
- ⏳ Generación de estados financieros (Balance General, Estado de Resultados)
- ⏳ Reportes ONAPRE (Form 1013, 2345, 3001)
- ⏳ Tests unitarios y de integración
- ⏳ Frontend del módulo de finanzas
- ⏳ Dashboard financiero

## Notas Técnicas

### Manejo de Decimales
- Todos los montos se almacenan como `Decimal(15,2)`
- Se usa `Number()` para conversiones en JavaScript
- Precisión de 2 decimales para montos monetarios

### Referencias Únicas
- Presupuestos: Por año (único)
- Transacciones: `TRX-G-2025-00001` (gasto), `TRX-I-2025-00001` (ingreso)
- Pagos: `PAG-2025-00001`
- Ingresos: `ING-2025-00001`

### Seguridad
- Todas las rutas requieren autenticación (`authenticate` middleware)
- Permisos por rol usando `authorize` middleware
- Validación de datos con Zod schemas

## Ejemplos de Uso

Ver `/backend/tests/finance/` para ejemplos completos de uso de la API.
