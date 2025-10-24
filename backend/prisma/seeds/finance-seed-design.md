# Diseño de Semillas para Módulo de Finanzas

## Objetivo
Crear datos iniciales realistas para el módulo de finanzas que permitan:
- Demostrar funcionalidades del sistema
- Realizar pruebas completas
- Capacitar usuarios
- Simular operaciones reales de una alcaldía venezolana

---

## 1. PRESUPUESTO ANUAL 2025

### Presupuesto Principal
```javascript
{
  year: 2025,
  totalAmount: 50000000.00, // 50 millones de Bs
  estimatedIncome: 50000000.00,
  status: 'ACTIVE',
  approvedBy: 'alcalde@municipal.gob.ve',
  approvedAt: '2024-12-15',
  notes: 'Presupuesto Municipal Ordinario 2025 - Aprobado por el Concejo Municipal'
}
```

### Fuentes de Ingreso Estimadas
```javascript
incomeSource: {
  situadoConstitucional: 30000000, // 60%
  tributosLocales: 8000000,        // 16%
  transferencias: 7000000,         // 14%
  otrosIngresos: 5000000           // 10%
}
```

---

## 2. PARTIDAS PRESUPUESTARIAS (Clasificador ONAPRE)

### Estructura de Partidas

#### 4.01 - GASTOS DE PERSONAL (40% = 20M)
```javascript
[
  {
    code: '4.01.01.00.00',
    name: 'Personal Fijo',
    allocatedAmount: 15000000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-RRHH'
  },
  {
    code: '4.01.02.00.00',
    name: 'Personal Contratado',
    allocatedAmount: 3000000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-RRHH'
  },
  {
    code: '4.01.03.00.00',
    name: 'Prestaciones Sociales',
    allocatedAmount: 2000000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-RRHH'
  }
]
```

#### 4.02 - MATERIALES Y SUMINISTROS (15% = 7.5M)
```javascript
[
  {
    code: '4.02.01.00.00',
    name: 'Alimentos y Bebidas',
    allocatedAmount: 500000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-SERV'
  },
  {
    code: '4.02.02.00.00',
    name: 'Vestido y Calzado',
    allocatedAmount: 300000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-RRHH'
  },
  {
    code: '4.02.03.00.00',
    name: 'Combustibles y Lubricantes',
    allocatedAmount: 2000000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-SERV'
  },
  {
    code: '4.02.04.00.00',
    name: 'Materiales de Construcción',
    allocatedAmount: 3000000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-OBRAS'
  },
  {
    code: '4.02.05.00.00',
    name: 'Materiales de Oficina',
    allocatedAmount: 800000,
    category: 'Gastos Corrientes',
    departmentId: null
  },
  {
    code: '4.02.06.00.00',
    name: 'Materiales de Limpieza',
    allocatedAmount: 400000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-SERV'
  },
  {
    code: '4.02.99.00.00',
    name: 'Otros Materiales y Suministros',
    allocatedAmount: 500000,
    category: 'Gastos Corrientes',
    departmentId: null
  }
]
```

#### 4.03 - SERVICIOS NO PERSONALES (20% = 10M)
```javascript
[
  {
    code: '4.03.01.00.00',
    name: 'Servicios Básicos',
    allocatedAmount: 2500000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-SERV'
  },
  {
    code: '4.03.02.00.00',
    name: 'Servicios de Arrendamiento',
    allocatedAmount: 1000000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-ADM'
  },
  {
    code: '4.03.03.00.00',
    name: 'Servicios Profesionales',
    allocatedAmount: 2000000,
    category: 'Gastos Corrientes',
    departmentId: null
  },
  {
    code: '4.03.04.00.00',
    name: 'Servicios de Capacitación',
    allocatedAmount: 500000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-RRHH'
  },
  {
    code: '4.03.05.00.00',
    name: 'Servicios de Mantenimiento',
    allocatedAmount: 2500000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-SERV'
  },
  {
    code: '4.03.06.00.00',
    name: 'Servicios de Publicidad',
    allocatedAmount: 800000,
    category: 'Gastos Corrientes',
    departmentId: 'DIR-COM'
  },
  {
    code: '4.03.99.00.00',
    name: 'Otros Servicios',
    allocatedAmount: 700000,
    category: 'Gastos Corrientes',
    departmentId: null
  }
]
```

#### 4.04 - ACTIVOS REALES (15% = 7.5M)
```javascript
[
  {
    code: '4.04.01.00.00',
    name: 'Edificios y Locales',
    allocatedAmount: 2000000,
    category: 'Gastos de Capital',
    departmentId: 'DIR-OBRAS'
  },
  {
    code: '4.04.02.00.00',
    name: 'Maquinaria y Equipo',
    allocatedAmount: 3000000,
    category: 'Gastos de Capital',
    departmentId: 'DIR-OBRAS'
  },
  {
    code: '4.04.03.00.00',
    name: 'Mobiliario y Equipo de Oficina',
    allocatedAmount: 1000000,
    category: 'Gastos de Capital',
    departmentId: 'DIR-ADM'
  },
  {
    code: '4.04.04.00.00',
    name: 'Equipos de Computación',
    allocatedAmount: 1000000,
    category: 'Gastos de Capital',
    departmentId: 'DIR-TIC'
  },
  {
    code: '4.04.05.00.00',
    name: 'Vehículos',
    allocatedAmount: 500000,
    category: 'Gastos de Capital',
    departmentId: 'DIR-SERV'
  }
]
```

#### 4.99 - ASIGNACIONES NO DISTRIBUIDAS (10% = 5M)
```javascript
[
  {
    code: '4.99.01.00.00',
    name: 'Reserva de Contingencia',
    allocatedAmount: 3000000,
    category: 'Asignaciones Especiales',
    departmentId: null
  },
  {
    code: '4.99.02.00.00',
    name: 'Imprevistos',
    allocatedAmount: 2000000,
    category: 'Asignaciones Especiales',
    departmentId: null
  }
]
```

**Total de Partidas:** 25 partidas principales

---

## 3. CUENTAS BANCARIAS

### Cuenta 1: Cuenta Corriente Principal
```javascript
{
  bankName: 'Banco de Venezuela',
  accountNumber: '0102-0001-12-0000123456',
  accountType: 'CORRIENTE',
  currency: 'VES',
  balance: 8500000.00,
  description: 'Cuenta principal para operaciones generales',
  isActive: true
}
```

### Cuenta 2: Cuenta de Nómina
```javascript
{
  bankName: 'Banco Bicentenario',
  accountNumber: '0175-0002-34-0000789012',
  accountType: 'CORRIENTE',
  currency: 'VES',
  balance: 15000000.00,
  description: 'Cuenta exclusiva para pago de nómina',
  isActive: true
}
```

### Cuenta 3: Cuenta de Proyectos
```javascript
{
  bankName: 'Banco del Tesoro',
  accountNumber: '0163-0003-56-0000345678',
  accountType: 'ESPECIAL',
  currency: 'VES',
  balance: 5000000.00,
  description: 'Cuenta para financiamiento de proyectos especiales',
  isActive: true
}
```

### Cuenta 4: Cuenta en Divisas
```javascript
{
  bankName: 'Banco Nacional de Crédito',
  accountNumber: '0191-0004-78-0000901234',
  accountType: 'CORRIENTE',
  currency: 'USD',
  balance: 50000.00,
  description: 'Cuenta en dólares para importaciones',
  isActive: true
}
```

---

## 4. INGRESOS (Enero - Marzo 2025)

### Enero 2025
```javascript
[
  {
    reference: 'ING-2025-00001',
    type: 'SITUADO',
    amount: 2500000,
    bankAccountId: 'cuenta-corriente-principal',
    concept: 'Situado Constitucional - Enero 2025',
    source: 'Gobierno Nacional',
    incomeDate: '2025-01-15',
    registeredBy: 'dir.finanzas@municipal.gob.ve'
  },
  {
    reference: 'ING-2025-00002',
    type: 'TRIBUTOS',
    amount: 650000,
    bankAccountId: 'cuenta-corriente-principal',
    concept: 'Recaudación Impuestos Municipales - Enero',
    source: 'Dirección de Hacienda',
    incomeDate: '2025-01-31',
    registeredBy: 'dir.finanzas@municipal.gob.ve'
  },
  {
    reference: 'ING-2025-00003',
    type: 'TASAS',
    amount: 150000,
    bankAccountId: 'cuenta-corriente-principal',
    concept: 'Tasas Administrativas - Enero',
    source: 'Dirección de Hacienda',
    incomeDate: '2025-01-31',
    registeredBy: 'dir.finanzas@municipal.gob.ve'
  }
]
```

### Febrero 2025
```javascript
[
  {
    reference: 'ING-2025-00004',
    type: 'SITUADO',
    amount: 2500000,
    bankAccountId: 'cuenta-corriente-principal',
    concept: 'Situado Constitucional - Febrero 2025',
    source: 'Gobierno Nacional',
    incomeDate: '2025-02-15',
    registeredBy: 'dir.finanzas@municipal.gob.ve'
  },
  {
    reference: 'ING-2025-00005',
    type: 'TRANSFERENCIAS',
    amount: 1000000,
    bankAccountId: 'cuenta-proyectos',
    concept: 'Transferencia FUS - Proyecto Vialidad',
    source: 'Fondo de Compensación Interterritorial',
    incomeDate: '2025-02-20',
    registeredBy: 'dir.finanzas@municipal.gob.ve'
  }
]
```

**Total de Ingresos:** 5 registros (6,800,000 Bs)

---

## 5. TRANSACCIONES (Ciclo del Gasto)

### Compromisos (10 transacciones)

#### Compromiso 1: Nómina Enero
```javascript
{
  reference: 'TRX-G-2025-00001',
  type: 'GASTO',
  status: 'PAGADO',
  amount: 1250000,
  budgetItemId: '4.01.01.00.00',
  concept: 'Nómina Personal Fijo - Enero 2025',
  beneficiary: 'Empleados Municipales',
  committedAt: '2025-01-05',
  accruedAt: '2025-01-25',
  paidAt: '2025-01-30',
  createdBy: 'dir.finanzas@municipal.gob.ve'
}
```

#### Compromiso 2: Combustible
```javascript
{
  reference: 'TRX-G-2025-00002',
  type: 'GASTO',
  status: 'PAGADO',
  amount: 150000,
  budgetItemId: '4.02.03.00.00',
  concept: 'Compra de Combustible - Enero',
  beneficiary: 'PDVSA',
  invoiceNumber: 'FACT-2025-001',
  committedAt: '2025-01-10',
  accruedAt: '2025-01-15',
  paidAt: '2025-01-20',
  createdBy: 'dir.servicios@municipal.gob.ve'
}
```

#### Compromiso 3: Servicios Básicos
```javascript
{
  reference: 'TRX-G-2025-00003',
  type: 'GASTO',
  status: 'CAUSADO',
  amount: 200000,
  budgetItemId: '4.03.01.00.00',
  concept: 'Electricidad - Enero 2025',
  beneficiary: 'CORPOELEC',
  invoiceNumber: 'ELEC-2025-001',
  committedAt: '2025-01-05',
  accruedAt: '2025-02-01',
  createdBy: 'dir.servicios@municipal.gob.ve'
}
```

#### Compromiso 4: Materiales de Construcción
```javascript
{
  reference: 'TRX-G-2025-00004',
  type: 'GASTO',
  status: 'COMPROMISO',
  amount: 500000,
  budgetItemId: '4.02.04.00.00',
  concept: 'Cemento y Cabillas - Proyecto Vialidad',
  beneficiary: 'Ferretería El Constructor C.A.',
  purchaseOrder: 'OC-2025-001',
  committedAt: '2025-02-10',
  createdBy: 'dir.obras@municipal.gob.ve'
}
```

#### Compromiso 5: Mantenimiento de Vehículos
```javascript
{
  reference: 'TRX-G-2025-00005',
  type: 'GASTO',
  status: 'PAGADO',
  amount: 80000,
  budgetItemId: '4.03.05.00.00',
  concept: 'Mantenimiento Preventivo Flota Municipal',
  beneficiary: 'Taller Mecánico Los Andes',
  invoiceNumber: 'MANT-2025-001',
  committedAt: '2025-01-15',
  accruedAt: '2025-01-20',
  paidAt: '2025-01-25',
  createdBy: 'dir.servicios@municipal.gob.ve'
}
```

#### Compromiso 6: Equipos de Computación
```javascript
{
  reference: 'TRX-G-2025-00006',
  type: 'GASTO',
  status: 'CAUSADO',
  amount: 300000,
  budgetItemId: '4.04.04.00.00',
  concept: 'Compra de Laptops para Dirección de Finanzas',
  beneficiary: 'Tecnología Avanzada C.A.',
  invoiceNumber: 'TECH-2025-001',
  purchaseOrder: 'OC-2025-002',
  committedAt: '2025-01-20',
  accruedAt: '2025-02-05',
  createdBy: 'dir.tic@municipal.gob.ve'
}
```

#### Compromiso 7: Servicios Profesionales
```javascript
{
  reference: 'TRX-G-2025-00007',
  type: 'GASTO',
  status: 'COMPROMISO',
  amount: 250000,
  budgetItemId: '4.03.03.00.00',
  concept: 'Auditoría Externa 2024',
  beneficiary: 'Auditores Asociados C.A.',
  contractNumber: 'CONT-2025-001',
  committedAt: '2025-02-01',
  createdBy: 'dir.finanzas@municipal.gob.ve'
}
```

#### Compromiso 8: Materiales de Oficina
```javascript
{
  reference: 'TRX-G-2025-00008',
  type: 'GASTO',
  status: 'PAGADO',
  amount: 50000,
  budgetItemId: '4.02.05.00.00',
  concept: 'Papelería y Útiles de Oficina',
  beneficiary: 'Librería Nacional',
  invoiceNumber: 'LIB-2025-001',
  committedAt: '2025-01-08',
  accruedAt: '2025-01-10',
  paidAt: '2025-01-15',
  createdBy: 'dir.admin@municipal.gob.ve'
}
```

#### Compromiso 9: Capacitación
```javascript
{
  reference: 'TRX-G-2025-00009',
  type: 'GASTO',
  status: 'CAUSADO',
  amount: 120000,
  budgetItemId: '4.03.04.00.00',
  concept: 'Curso de Gestión Pública - Personal RRHH',
  beneficiary: 'Instituto de Capacitación Municipal',
  committedAt: '2025-01-25',
  accruedAt: '2025-02-10',
  createdBy: 'dir.rrhh@municipal.gob.ve'
}
```

#### Compromiso 10: Publicidad
```javascript
{
  reference: 'TRX-G-2025-00010',
  type: 'GASTO',
  status: 'COMPROMISO',
  amount: 180000,
  budgetItemId: '4.03.06.00.00',
  concept: 'Campaña de Comunicación - Rendición de Cuentas',
  beneficiary: 'Agencia Creativa Digital',
  contractNumber: 'CONT-2025-002',
  committedAt: '2025-02-15',
  createdBy: 'dir.comunicaciones@municipal.gob.ve'
}
```

**Resumen de Transacciones:**
- Total: 10 transacciones
- Pagadas: 4 (1,530,000 Bs)
- Causadas: 3 (620,000 Bs)
- Compromisos: 3 (930,000 Bs)
- **Total Comprometido:** 3,080,000 Bs

---

## 6. PAGOS REALIZADOS

```javascript
[
  {
    reference: 'PAG-2025-00001',
    amount: 1250000,
    paymentMethod: 'DOMICILIACION',
    bankAccountId: 'cuenta-nomina',
    beneficiary: 'Empleados Municipales',
    beneficiaryAccount: 'Múltiples cuentas',
    concept: 'Pago Nómina Enero 2025',
    paymentDate: '2025-01-30',
    status: 'COMPLETED',
    createdBy: 'dir.finanzas@municipal.gob.ve'
  },
  {
    reference: 'PAG-2025-00002',
    amount: 150000,
    paymentMethod: 'TRANSFERENCIA',
    bankAccountId: 'cuenta-corriente-principal',
    beneficiary: 'PDVSA',
    beneficiaryAccount: '0102-1234-56-7890123456',
    beneficiaryBank: 'Banco de Venezuela',
    concept: 'Pago Combustible Enero',
    paymentDate: '2025-01-20',
    status: 'COMPLETED',
    createdBy: 'dir.finanzas@municipal.gob.ve'
  },
  {
    reference: 'PAG-2025-00003',
    amount: 80000,
    paymentMethod: 'TRANSFERENCIA',
    bankAccountId: 'cuenta-corriente-principal',
    beneficiary: 'Taller Mecánico Los Andes',
    beneficiaryAccount: '0175-9876-54-3210987654',
    beneficiaryBank: 'Banco Bicentenario',
    concept: 'Pago Mantenimiento Vehículos',
    paymentDate: '2025-01-25',
    status: 'COMPLETED',
    createdBy: 'dir.finanzas@municipal.gob.ve'
  },
  {
    reference: 'PAG-2025-00004',
    amount: 50000,
    paymentMethod: 'CHEQUE',
    bankAccountId: 'cuenta-corriente-principal',
    beneficiary: 'Librería Nacional',
    concept: 'Pago Materiales de Oficina',
    paymentDate: '2025-01-15',
    status: 'COMPLETED',
    createdBy: 'dir.finanzas@municipal.gob.ve'
  }
]
```

---

## 7. ASIENTOS CONTABLES

### Plan de Cuentas Simplificado
```javascript
const chartOfAccounts = [
  // ACTIVOS (1.x.x.x)
  { code: '1.1.1.01', name: 'Caja', type: 'ACTIVO' },
  { code: '1.1.2.01', name: 'Bancos - Cuenta Corriente', type: 'ACTIVO' },
  { code: '1.1.2.02', name: 'Bancos - Cuenta Nómina', type: 'ACTIVO' },
  { code: '1.1.2.03', name: 'Bancos - Cuenta Proyectos', type: 'ACTIVO' },
  { code: '1.2.1.01', name: 'Cuentas por Cobrar', type: 'ACTIVO' },
  { code: '1.3.1.01', name: 'Mobiliario y Equipo', type: 'ACTIVO' },
  { code: '1.3.1.02', name: 'Vehículos', type: 'ACTIVO' },
  { code: '1.3.1.03', name: 'Equipos de Computación', type: 'ACTIVO' },
  
  // PASIVOS (2.x.x.x)
  { code: '2.1.1.01', name: 'Cuentas por Pagar', type: 'PASIVO' },
  { code: '2.1.2.01', name: 'Retenciones por Pagar', type: 'PASIVO' },
  { code: '2.1.3.01', name: 'Prestaciones Sociales por Pagar', type: 'PASIVO' },
  
  // PATRIMONIO (3.x.x.x)
  { code: '3.1.1.01', name: 'Patrimonio Municipal', type: 'PATRIMONIO' },
  { code: '3.2.1.01', name: 'Resultado del Ejercicio', type: 'PATRIMONIO' },
  
  // INGRESOS (4.x.x.x)
  { code: '4.1.1.01', name: 'Situado Constitucional', type: 'INGRESO' },
  { code: '4.1.2.01', name: 'Impuestos Municipales', type: 'INGRESO' },
  { code: '4.1.3.01', name: 'Tasas y Multas', type: 'INGRESO' },
  { code: '4.1.4.01', name: 'Transferencias', type: 'INGRESO' },
  
  // GASTOS (5.x.x.x)
  { code: '5.1.1.01', name: 'Gastos de Personal', type: 'GASTO' },
  { code: '5.1.2.01', name: 'Materiales y Suministros', type: 'GASTO' },
  { code: '5.1.3.01', name: 'Servicios Básicos', type: 'GASTO' },
  { code: '5.1.4.01', name: 'Servicios Profesionales', type: 'GASTO' },
  { code: '5.1.5.01', name: 'Mantenimiento', type: 'GASTO' }
];
```

### Asientos Automáticos Generados
Los asientos se generarán automáticamente para cada transacción según el servicio de contabilidad existente.

---

## 8. ESTADÍSTICAS ESPERADAS

Después de ejecutar el seed, el sistema debería mostrar:

### Dashboard Financiero
- **Presupuesto Total:** 50,000,000 Bs
- **Ejecutado (Pagado):** 1,530,000 Bs (3.06%)
- **Comprometido:** 3,080,000 Bs (6.16%)
- **Disponible:** 46,920,000 Bs (93.84%)

### Tesorería
- **Saldo Total en Bancos:** 28,550,000 Bs
  - Cuenta Corriente: 8,500,000 Bs
  - Cuenta Nómina: 15,000,000 Bs
  - Cuenta Proyectos: 5,000,000 Bs
  - Cuenta USD: 50,000 USD

### Ingresos vs Gastos
- **Ingresos (Ene-Feb):** 6,800,000 Bs
- **Gastos Pagados:** 1,530,000 Bs
- **Superávit:** 5,270,000 Bs

---

## 9. ORDEN DE EJECUCIÓN DEL SEED

```javascript
1. Verificar que existen usuarios (del seed de organización)
2. Crear Presupuesto 2025
3. Crear 25 Partidas Presupuestarias
4. Crear 4 Cuentas Bancarias
5. Crear 5 Ingresos
6. Crear 10 Transacciones (con estados variados)
7. Crear 4 Pagos
8. Generar Asientos Contables automáticos
9. Actualizar saldos de partidas presupuestarias
10. Actualizar saldos de cuentas bancarias
```

---

## 10. VALIDACIONES POST-SEED

Después de ejecutar el seed, verificar:

- [ ] Presupuesto 2025 existe y está ACTIVE
- [ ] 25 partidas presupuestarias creadas
- [ ] Suma de partidas = 50,000,000 Bs
- [ ] 4 cuentas bancarias creadas
- [ ] Suma de saldos bancarios = 28,550,000 Bs
- [ ] 5 ingresos registrados
- [ ] 10 transacciones creadas con estados correctos
- [ ] 4 pagos completados
- [ ] Asientos contables generados automáticamente
- [ ] Saldos de partidas actualizados correctamente
- [ ] Dashboard muestra estadísticas correctas

---

## 11. DATOS ADICIONALES OPCIONALES

### Modificaciones Presupuestarias (si se implementa)
```javascript
[
  {
    type: 'TRASPASO',
    reference: 'MOD-2025-001',
    description: 'Traspaso de Imprevistos a Combustible',
    amount: 100000,
    fromBudgetItem: '4.99.02.00.00',
    toBudgetItem: '4.02.03.00.00',
    justification: 'Aumento en precio del combustible',
    status: 'APPROVED',
    approvedBy: 'alcalde@municipal.gob.ve'
  }
]
```

### Cajas Chicas (si se implementa)
```javascript
[
  {
    code: 'CC-001',
    name: 'Caja Chica Dirección de Finanzas',
    departmentId: 'DIR-FIN',
    custodianId: 'coordinador1@municipal.gob.ve',
    maxAmount: 50000,
    currentBalance: 35000,
    status: 'ACTIVE'
  }
]
```

---

## NOTAS FINALES

- Todos los montos están en Bolívares (VES)
- Las fechas son del año 2025 (enero-febrero)
- Los códigos ONAPRE son simplificados pero realistas
- Los nombres de beneficiarios son ficticios
- Los números de cuenta son ficticios pero con formato real
- Este seed debe ejecutarse DESPUÉS del seed de organización

---

**Archivo de Implementación:** `backend/prisma/seeds/finance-seed.js`  
**Fecha de Diseño:** 21 de Octubre, 2025
