# Arquitectura de Permisos Granulares

## Concepto General

El sistema debe tener **3 niveles de granularidad**:

1. **Módulo**: Área general del sistema (ej: Finanzas, RRHH)
2. **Interfaz/Funcionalidad**: Pantalla o característica específica (ej: Cajas Chicas, Nómina)
3. **Acción**: Operación específica (ej: Ver, Crear, Aprobar, Exportar)

## Estructura de Permisos

### Formato de Permiso
```
{modulo}.{interfaz}.{accion}
```

**Ejemplos:**
- `finanzas.cajas_chicas.ver`
- `finanzas.cajas_chicas.crear`
- `finanzas.cajas_chicas.aprobar`
- `finanzas.presupuesto.modificar`
- `rrhh.nomina.generar`
- `rrhh.nomina.aprobar`

---

## Mapeo Completo del Sistema

### 1. FINANZAS

#### 1.1 Dashboard Financiero
- **Ruta**: `/finanzas`
- **Permisos**:
  - `finanzas.dashboard.ver` - Ver dashboard con gráficos
  - `finanzas.dashboard.exportar` - Exportar reportes del dashboard

#### 1.2 Presupuesto
- **Ruta**: `/finanzas/presupuesto`
- **Permisos**:
  - `finanzas.presupuesto.ver` - Ver presupuesto
  - `finanzas.presupuesto.crear` - Crear partida presupuestaria
  - `finanzas.presupuesto.modificar` - Modificar presupuesto
  - `finanzas.presupuesto.eliminar` - Eliminar partida
  - `finanzas.presupuesto.exportar` - Exportar a Excel/PDF

#### 1.3 Modificaciones Presupuestarias
- **Ruta**: `/finanzas/modificaciones`
- **Permisos**:
  - `finanzas.modificaciones.ver` - Ver modificaciones
  - `finanzas.modificaciones.crear` - Crear modificación (ampliación/reducción)
  - `finanzas.modificaciones.aprobar` - Aprobar modificación
  - `finanzas.modificaciones.rechazar` - Rechazar modificación
  - `finanzas.modificaciones.exportar` - Exportar reporte

#### 1.4 Ejecución del Gasto
- **Ruta**: `/finanzas/ejecucion`
- **Permisos**:
  - `finanzas.ejecucion.ver` - Ver ejecución
  - `finanzas.ejecucion.registrar` - Registrar compromiso
  - `finanzas.ejecucion.causado` - Registrar causado
  - `finanzas.ejecucion.pagado` - Registrar pago
  - `finanzas.ejecucion.exportar` - Exportar reporte

#### 1.5 Tesorería
- **Ruta**: `/finanzas/tesoreria`
- **Permisos**:
  - `finanzas.tesoreria.ver` - Ver saldo y movimientos
  - `finanzas.tesoreria.ingresos` - Registrar ingresos
  - `finanzas.tesoreria.egresos` - Registrar egresos
  - `finanzas.tesoreria.conciliar` - Realizar conciliación
  - `finanzas.tesoreria.exportar` - Exportar movimientos

#### 1.6 Conciliación Bancaria
- **Ruta**: `/finanzas/conciliacion`
- **Permisos**:
  - `finanzas.conciliacion.ver` - Ver conciliaciones
  - `finanzas.conciliacion.crear` - Crear conciliación
  - `finanzas.conciliacion.aprobar` - Aprobar conciliación
  - `finanzas.conciliacion.exportar` - Exportar reporte

#### 1.7 Programación de Pagos
- **Ruta**: `/finanzas/programacion-pagos`
- **Permisos**:
  - `finanzas.programacion.ver` - Ver programación
  - `finanzas.programacion.crear` - Crear programación
  - `finanzas.programacion.modificar` - Modificar programación
  - `finanzas.programacion.aprobar` - Aprobar programación
  - `finanzas.programacion.exportar` - Exportar

#### 1.8 Proyección de Flujo de Caja
- **Ruta**: `/finanzas/flujo-caja`
- **Permisos**:
  - `finanzas.flujo_caja.ver` - Ver proyección
  - `finanzas.flujo_caja.crear` - Crear proyección
  - `finanzas.flujo_caja.modificar` - Modificar proyección
  - `finanzas.flujo_caja.exportar` - Exportar

#### 1.9 Cajas Chicas
- **Ruta**: `/finanzas/cajas-chicas`
- **Permisos**:
  - `finanzas.cajas_chicas.ver` - Ver cajas chicas
  - `finanzas.cajas_chicas.crear` - Crear caja chica
  - `finanzas.cajas_chicas.modificar` - Modificar caja chica
  - `finanzas.cajas_chicas.rendir` - Rendir cuenta
  - `finanzas.cajas_chicas.aprobar` - Aprobar rendición
  - `finanzas.cajas_chicas.reembolsar` - Aprobar reembolso
  - `finanzas.cajas_chicas.cerrar` - Cerrar caja chica
  - `finanzas.cajas_chicas.exportar` - Exportar

#### 1.10 Anticipos a Empleados
- **Ruta**: `/finanzas/anticipos`
- **Permisos**:
  - `finanzas.anticipos.ver` - Ver anticipos
  - `finanzas.anticipos.crear` - Crear solicitud de anticipo
  - `finanzas.anticipos.aprobar` - Aprobar anticipo
  - `finanzas.anticipos.rechazar` - Rechazar anticipo
  - `finanzas.anticipos.pagar` - Registrar pago
  - `finanzas.anticipos.descontar` - Registrar descuento en nómina
  - `finanzas.anticipos.exportar` - Exportar

#### 1.11 Contabilidad
- **Ruta**: `/finanzas/contabilidad`
- **Permisos**:
  - `finanzas.contabilidad.ver` - Ver asientos
  - `finanzas.contabilidad.crear` - Crear asiento contable
  - `finanzas.contabilidad.modificar` - Modificar asiento
  - `finanzas.contabilidad.eliminar` - Eliminar asiento
  - `finanzas.contabilidad.mayor` - Ver libro mayor
  - `finanzas.contabilidad.diario` - Ver libro diario
  - `finanzas.contabilidad.balance` - Ver balance
  - `finanzas.contabilidad.exportar` - Exportar

#### 1.12 Cierre Contable
- **Ruta**: `/finanzas/cierre-contable`
- **Permisos**:
  - `finanzas.cierre.ver` - Ver cierres
  - `finanzas.cierre.iniciar` - Iniciar cierre mensual
  - `finanzas.cierre.verificar` - Verificar cierre
  - `finanzas.cierre.aprobar` - Aprobar cierre
  - `finanzas.cierre.rechazar` - Rechazar cierre
  - `finanzas.cierre.exportar` - Exportar reporte de cierre

#### 1.13 Reportes Financieros
- **Ruta**: `/finanzas/reportes`
- **Permisos**:
  - `finanzas.reportes.ver` - Ver reportes
  - `finanzas.reportes.generar` - Generar reporte
  - `finanzas.reportes.exportar` - Exportar a Excel/PDF

---

### 2. RECURSOS HUMANOS (RRHH)

#### 2.1 Dashboard RRHH
- **Ruta**: `/rrhh`
- **Permisos**:
  - `rrhh.dashboard.ver` - Ver dashboard
  - `rrhh.dashboard.exportar` - Exportar métricas

#### 2.2 Empleados
- **Ruta**: `/rrhh/empleados`
- **Permisos**:
  - `rrhh.empleados.ver` - Ver lista de empleados
  - `rrhh.empleados.ver_detalle` - Ver expediente completo
  - `rrhh.empleados.crear` - Registrar nuevo empleado
  - `rrhh.empleados.modificar` - Modificar datos del empleado
  - `rrhh.empleados.inactivar` - Inactivar empleado
  - `rrhh.empleados.exportar` - Exportar nómina de empleados

#### 2.3 Nómina
- **Ruta**: `/rrhh/nomina`
- **Permisos**:
  - `rrhh.nomina.ver` - Ver nóminas
  - `rrhh.nomina.generar` - Generar nómina quincenal/mensual
  - `rrhh.nomina.calcular` - Calcular deducciones y aportes
  - `rrhh.nomina.aprobar` - Aprobar nómina
  - `rrhh.nomina.procesar_pago` - Procesar pago de nómina
  - `rrhh.nomina.revertir` - Revertir nómina procesada
  - `rrhh.nomina.exportar` - Exportar a Excel/PDF/Banco

#### 2.4 Asistencia
- **Ruta**: `/rrhh/asistencia`
- **Permisos**:
  - `rrhh.asistencia.ver` - Ver registros de asistencia
  - `rrhh.asistencia.registrar` - Registrar entrada/salida manual
  - `rrhh.asistencia.modificar` - Modificar registro
  - `rrhh.asistencia.aprobar` - Aprobar modificaciones
  - `rrhh.asistencia.exportar` - Exportar reporte

#### 2.5 Vacaciones
- **Ruta**: `/rrhh/vacaciones`
- **Permisos**:
  - `rrhh.vacaciones.ver` - Ver vacaciones
  - `rrhh.vacaciones.solicitar` - Solicitar vacaciones
  - `rrhh.vacaciones.aprobar` - Aprobar solicitud
  - `rrhh.vacaciones.rechazar` - Rechazar solicitud
  - `rrhh.vacaciones.cancelar` - Cancelar vacaciones aprobadas
  - `rrhh.vacaciones.exportar` - Exportar

#### 2.6 Caja de Ahorro
- **Ruta**: `/rrhh/caja-ahorro`
- **Permisos**:
  - `rrhh.caja_ahorro.ver` - Ver cuentas
  - `rrhh.caja_ahorro.crear_cuenta` - Crear cuenta de ahorro
  - `rrhh.caja_ahorro.deposito` - Registrar depósito
  - `rrhh.caja_ahorro.retiro` - Registrar retiro
  - `rrhh.caja_ahorro.prestamo` - Otorgar préstamo
  - `rrhh.caja_ahorro.aprobar_prestamo` - Aprobar préstamo
  - `rrhh.caja_ahorro.exportar` - Exportar

#### 2.7 Dependientes
- **Ruta**: `/rrhh/dependientes`
- **Permisos**:
  - `rrhh.dependientes.ver` - Ver dependientes
  - `rrhh.dependientes.crear` - Registrar dependiente
  - `rrhh.dependientes.modificar` - Modificar dependiente
  - `rrhh.dependientes.eliminar` - Eliminar dependiente

#### 2.8 Acciones Disciplinarias
- **Ruta**: `/rrhh/disciplina`
- **Permisos**:
  - `rrhh.disciplina.ver` - Ver expedientes disciplinarios
  - `rrhh.disciplina.crear` - Crear amonestación
  - `rrhh.disciplina.modificar` - Modificar expediente
  - `rrhh.disciplina.aprobar` - Aprobar sanción
  - `rrhh.disciplina.exportar` - Exportar

#### 2.9 Reportes RRHH
- **Ruta**: `/rrhh/reportes`
- **Permisos**:
  - `rrhh.reportes.ver` - Ver reportes
  - `rrhh.reportes.generar` - Generar reporte
  - `rrhh.reportes.exportar` - Exportar

---

### 3. TRIBUTARIO

#### 3.1 Dashboard Tributario
- **Ruta**: `/tributario/dashboard`
- **Permisos**:
  - `tributario.dashboard.ver` - Ver dashboard

#### 3.2 Contribuyentes
- **Ruta**: `/tributario/contribuyentes`
- **Permisos**:
  - `tributario.contribuyentes.ver` - Ver contribuyentes
  - `tributario.contribuyentes.crear` - Registrar contribuyente
  - `tributario.contribuyentes.modificar` - Modificar datos
  - `tributario.contribuyentes.inactivar` - Inactivar
  - `tributario.contribuyentes.exportar` - Exportar

#### 3.3 Inmuebles
- **Ruta**: `/tributario/inmuebles`
- **Permisos**:
  - `tributario.inmuebles.ver` - Ver inmuebles
  - `tributario.inmuebles.crear` - Registrar inmueble
  - `tributario.inmuebles.modificar` - Modificar catastro
  - `tributario.inmuebles.valorar` - Actualizar avalúo
  - `tributario.inmuebles.exportar` - Exportar

#### 3.4 Actividades Económicas
- **Ruta**: `/tributario/actividades`
- **Permisos**:
  - `tributario.actividades.ver` - Ver licencias
  - `tributario.actividades.crear` - Otorgar licencia
  - `tributario.actividades.modificar` - Modificar licencia
  - `tributario.actividades.renovar` - Renovar licencia
  - `tributario.actividades.suspender` - Suspender licencia
  - `tributario.actividades.exportar` - Exportar

#### 3.5 Vehículos
- **Ruta**: `/tributario/vehiculos`
- **Permisos**:
  - `tributario.vehiculos.ver` - Ver vehículos
  - `tributario.vehiculos.crear` - Registrar vehículo
  - `tributario.vehiculos.modificar` - Modificar datos
  - `tributario.vehiculos.exportar` - Exportar

#### 3.6 Declaraciones
- **Ruta**: `/tributario/declaraciones`
- **Permisos**:
  - `tributario.declaraciones.ver` - Ver declaraciones
  - `tributario.declaraciones.crear` - Registrar declaración
  - `tributario.declaraciones.aprobar` - Aprobar declaración
  - `tributario.declaraciones.rechazar` - Rechazar declaración

#### 3.7 Pagos
- **Ruta**: `/tributario/pagos`
- **Permisos**:
  - `tributario.pagos.ver` - Ver pagos
  - `tributario.pagos.registrar` - Registrar pago
  - `tributario.pagos.anular` - Anular pago
  - `tributario.pagos.exportar` - Exportar

#### 3.8 Solvencias
- **Ruta**: `/tributario/solvencias`
- **Permisos**:
  - `tributario.solvencias.ver` - Ver solvencias
  - `tributario.solvencias.generar` - Generar solvencia
  - `tributario.solvencias.aprobar` - Aprobar solvencia
  - `tributario.solvencias.exportar` - Exportar

#### 3.9 Fiscalización
- **Ruta**: `/tributario/fiscalizacion`
- **Permisos**:
  - `tributario.fiscalizacion.ver` - Ver fiscalizaciones
  - `tributario.fiscalizacion.crear` - Crear fiscalización
  - `tributario.fiscalizacion.modificar` - Modificar
  - `tributario.fiscalizacion.cerrar` - Cerrar fiscalización
  - `tributario.fiscalizacion.exportar` - Exportar

---

### 4. PROYECTOS

#### 4.1 Dashboard Proyectos
- **Ruta**: `/proyectos/dashboard`
- **Permisos**:
  - `proyectos.dashboard.ver` - Ver dashboard

#### 4.2 Lista de Proyectos
- **Ruta**: `/proyectos`
- **Permisos**:
  - `proyectos.lista.ver` - Ver proyectos
  - `proyectos.lista.crear` - Crear proyecto
  - `proyectos.lista.modificar` - Modificar proyecto
  - `proyectos.lista.eliminar` - Eliminar proyecto
  - `proyectos.lista.exportar` - Exportar

#### 4.3 Detalle de Proyecto
- **Ruta**: `/proyectos/[id]`
- **Permisos**:
  - `proyectos.detalle.ver` - Ver detalle
  - `proyectos.detalle.modificar_estado` - Cambiar estado
  - `proyectos.detalle.asignar_responsable` - Asignar responsable
  - `proyectos.detalle.cargar_documentos` - Subir documentos
  - `proyectos.detalle.cargar_fotos` - Subir fotos de avance

---

### 5. CATASTRO

#### 5.1 Propiedades
- **Ruta**: `/catastro/propiedades`
- **Permisos**:
  - `catastro.propiedades.ver` - Ver propiedades
  - `catastro.propiedades.crear` - Registrar propiedad
  - `catastro.propiedades.modificar` - Modificar datos
  - `catastro.propiedades.exportar` - Exportar

#### 5.2 Variables Urbanas
- **Ruta**: `/catastro/variables-urbanas`
- **Permisos**:
  - `catastro.variables.ver` - Ver variables
  - `catastro.variables.crear` - Crear variable
  - `catastro.variables.modificar` - Modificar variable
  - `catastro.variables.exportar` - Exportar

#### 5.3 Permisos de Construcción
- **Ruta**: `/catastro/permisos`
- **Permisos**:
  - `catastro.permisos.ver` - Ver permisos
  - `catastro.permisos.crear` - Crear solicitud
  - `catastro.permisos.revisar` - Revisar solicitud
  - `catastro.permisos.aprobar` - Aprobar permiso
  - `catastro.permisos.rechazar` - Rechazar permiso
  - `catastro.permisos.exportar` - Exportar

---

### 6. ADMINISTRACIÓN

#### 6.1 Usuarios
- **Ruta**: `/administracion/usuarios`
- **Permisos**:
  - `admin.usuarios.ver` - Ver usuarios
  - `admin.usuarios.crear` - Crear usuario
  - `admin.usuarios.modificar` - Modificar usuario
  - `admin.usuarios.inactivar` - Inactivar usuario
  - `admin.usuarios.resetear_clave` - Resetear contraseña
  - `admin.usuarios.asignar_rol` - Asignar rol

#### 6.2 Roles
- **Ruta**: `/administracion/roles`
- **Permisos**:
  - `admin.roles.ver` - Ver roles
  - `admin.roles.crear` - Crear rol personalizado
  - `admin.roles.modificar` - Modificar rol
  - `admin.roles.eliminar` - Eliminar rol
  - `admin.roles.asignar_permisos` - Asignar permisos a rol

#### 6.3 Permisos
- **Ruta**: `/administracion/permisos`
- **Permisos**:
  - `admin.permisos.ver` - Ver matriz de permisos
  - `admin.permisos.modificar` - Modificar permisos de rol
  - `admin.permisos.excepciones` - Crear excepciones de usuario

---

## Roles Predefinidos Sugeridos

### FINANZAS
1. **Director de Finanzas**
   - Acceso completo a todo Finanzas
   - Puede aprobar todo

2. **Supervisor de Finanzas**
   - Ver todo
   - Aprobar cajas chicas, anticipos, conciliaciones
   - No puede aprobar modificaciones presupuestarias ni cierres

3. **Analista Financiero Senior**
   - Ver todo
   - Crear/modificar presupuesto, ejecución, programación
   - No puede aprobar

4. **Analista Financiero Junior**
   - Ver todo
   - Registrar en ejecución, tesorería
   - No puede modificar presupuesto

5. **Cajero**
   - Ver cajas chicas
   - Crear/rendir cajas chicas
   - Registrar ingresos/egresos de tesorería

### RRHH
1. **Director de RRHH**
   - Acceso completo

2. **Supervisor de Nómina**
   - Ver empleados
   - Generar y aprobar nómina
   - Ver asistencia

3. **Analista de RRHH**
   - Crear/modificar empleados
   - Registrar asistencia
   - No puede generar nómina

4. **Empleado (Auto-servicio)**
   - Ver su propio expediente
   - Solicitar vacaciones
   - Ver sus recibos de pago

### TRIBUTARIO
1. **Director de Rentas**
   - Acceso completo

2. **Supervisor de Fiscalización**
   - Ver todo
   - Crear y cerrar fiscalizaciones
   - Aprobar solvencias

3. **Analista de Catastro**
   - Ver contribuyentes, inmuebles
   - Crear/modificar inmuebles
   - Valorar inmuebles

4. **Cajero Tributario**
   - Ver contribuyentes
   - Registrar pagos
   - Generar solvencias (sin aprobar)

---

## Implementación Técnica

### Base de Datos
```sql
-- Tabla de permisos granulares
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL, -- ej: "finanzas.cajas_chicas.aprobar"
  module VARCHAR(50) NOT NULL,       -- ej: "finanzas"
  feature VARCHAR(50) NOT NULL,      -- ej: "cajas_chicas"
  action VARCHAR(50) NOT NULL,       -- ej: "aprobar"
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Tabla de roles personalizados
CREATE TABLE custom_roles (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL, -- ej: "Director de Finanzas"
  description TEXT,
  is_system BOOLEAN DEFAULT false,   -- true para roles predefinidos
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relación roles-permisos
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES custom_roles(id),
  permission_id UUID REFERENCES permissions(id),
  UNIQUE(role_id, permission_id)
);

-- Relación usuarios-roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES custom_roles(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
```

### Verificación en Frontend
```javascript
// Hook mejorado
const { can } = usePermissions();

// Verificar permiso granular
if (can('finanzas.cajas_chicas.aprobar')) {
  // Mostrar botón de aprobar
}

// Componente
<Can permission="finanzas.nomina.generar">
  <Button>Generar Nómina</Button>
</Can>
```

### Verificación en Backend
```javascript
// Middleware
router.post(
  '/cajas-chicas/:id/aprobar',
  authenticate,
  requirePermission('finanzas.cajas_chicas.aprobar'),
  aprobarCajaChica
);
```
