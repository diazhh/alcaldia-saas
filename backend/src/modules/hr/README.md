# Módulo de Recursos Humanos (HR)

## Descripción
Módulo completo para la gestión de recursos humanos del Sistema Integral de Gestión Municipal.

## Estructura

```
hr/
├── controllers/          # Controladores de las rutas
│   ├── employee.controller.js
│   ├── position.controller.js
│   ├── attendance.controller.js
│   ├── vacation.controller.js
│   ├── leave.controller.js
│   ├── payroll.controller.js
│   ├── payroll-concept.controller.js
│   ├── document.controller.js
│   ├── evaluation.controller.js
│   ├── training.controller.js
│   └── severance.controller.js
├── services/            # Lógica de negocio
│   ├── employee.service.js
│   ├── position.service.js
│   ├── attendance.service.js
│   ├── vacation.service.js
│   ├── leave.service.js
│   ├── payroll.service.js
│   ├── payroll-concept.service.js
│   └── severance.service.js
├── routes.js            # Definición de rutas
└── validations.js       # Schemas de validación Zod
```

## Funcionalidades Implementadas

### 1. Gestión de Empleados
- ✅ CRUD completo de empleados
- ✅ Generación automática de número de empleado
- ✅ Gestión de estados (activo, inactivo, suspendido, retirado)
- ✅ Cálculo de saldo de vacaciones
- ✅ Estadísticas de empleados

### 2. Gestión de Cargos/Posiciones
- ✅ CRUD de cargos
- ✅ Definición de niveles y categorías
- ✅ Rangos salariales

### 3. Control de Asistencia
- ✅ Registro de marcaciones (entrada/salida)
- ✅ Cálculo automático de horas trabajadas
- ✅ Detección de retardos y ausencias
- ✅ Sistema de justificaciones
- ✅ Reportes de asistencia

### 4. Gestión de Vacaciones
- ✅ Cálculo de días disponibles según antigüedad
- ✅ Solicitud de vacaciones
- ✅ Workflow de aprobación/rechazo
- ✅ Descuento automático de días

### 5. Permisos y Licencias
- ✅ Gestión de permisos (remunerados/no remunerados)
- ✅ Reposos médicos
- ✅ Licencias especiales (maternidad, paternidad)
- ✅ Workflow de aprobación

### 6. Nómina
- ✅ Creación de períodos de nómina
- ✅ Motor de cálculo automático
- ✅ Gestión de conceptos (asignaciones, deducciones, aportes patronales)
- ✅ Integración con asistencia
- ✅ Aprobación de nómina
- ✅ Exportación a formato bancario (TXT)

### 7. Prestaciones Sociales
- ✅ Cálculo mensual según ley venezolana
- ✅ Cálculo de intereses
- ✅ Liquidación al egreso
- ✅ Historial de prestaciones

### 8. Expediente Digital
- ✅ Gestión de documentos del empleado
- ✅ Control de vencimientos
- ✅ Historial de documentos

### 9. Evaluación de Desempeño
- ✅ Creación de evaluaciones
- ✅ Cálculo automático de puntuación final
- ✅ Clasificación por rating
- ✅ Reconocimiento por empleado

### 10. Capacitaciones
- ✅ Gestión de programas de capacitación
- ✅ Inscripción de empleados
- ✅ Seguimiento de participación
- ✅ Historial de capacitaciones por empleado

## Rutas API

### Empleados
- `GET /api/hr/employees` - Listar empleados
- `GET /api/hr/employees/:id` - Obtener empleado
- `GET /api/hr/employees/:id/profile` - Expediente completo
- `POST /api/hr/employees` - Crear empleado
- `PUT /api/hr/employees/:id` - Actualizar empleado
- `PATCH /api/hr/employees/:id/status` - Cambiar estado
- `DELETE /api/hr/employees/:id` - Eliminar empleado
- `GET /api/hr/employees/stats/general` - Estadísticas

### Cargos
- `GET /api/hr/positions` - Listar cargos
- `GET /api/hr/positions/:id` - Obtener cargo
- `POST /api/hr/positions` - Crear cargo
- `PUT /api/hr/positions/:id` - Actualizar cargo
- `DELETE /api/hr/positions/:id` - Eliminar cargo

### Asistencia
- `GET /api/hr/attendance` - Listar asistencias
- `GET /api/hr/attendance/employee/:employeeId` - Por empleado
- `POST /api/hr/attendance` - Registrar asistencia
- `PATCH /api/hr/attendance/:id/justify` - Justificar
- `GET /api/hr/attendance/report` - Generar reporte

### Vacaciones
- `GET /api/hr/vacations` - Listar solicitudes
- `GET /api/hr/vacations/employee/:employeeId` - Por empleado
- `GET /api/hr/vacations/balance/:employeeId` - Saldo disponible
- `POST /api/hr/vacations` - Crear solicitud
- `PATCH /api/hr/vacations/:id/review` - Revisar solicitud

### Permisos
- `GET /api/hr/leaves` - Listar permisos
- `GET /api/hr/leaves/employee/:employeeId` - Por empleado
- `POST /api/hr/leaves` - Crear permiso
- `PATCH /api/hr/leaves/:id/review` - Revisar permiso

### Nómina
- `GET /api/hr/payrolls` - Listar nóminas
- `GET /api/hr/payrolls/:id` - Obtener nómina
- `POST /api/hr/payrolls` - Crear nómina
- `POST /api/hr/payrolls/:id/calculate` - Calcular nómina
- `POST /api/hr/payrolls/:id/approve` - Aprobar nómina
- `GET /api/hr/payrolls/:id/export` - Exportar a TXT

### Conceptos de Nómina
- `GET /api/hr/payroll-concepts` - Listar conceptos
- `POST /api/hr/payroll-concepts` - Crear concepto
- `PUT /api/hr/payroll-concepts/:id` - Actualizar concepto
- `DELETE /api/hr/payroll-concepts/:id` - Eliminar concepto

### Documentos
- `GET /api/hr/documents/employee/:employeeId` - Por empleado
- `POST /api/hr/documents` - Subir documento
- `DELETE /api/hr/documents/:id` - Eliminar documento

### Evaluaciones
- `GET /api/hr/evaluations` - Listar evaluaciones
- `GET /api/hr/evaluations/employee/:employeeId` - Por empleado
- `POST /api/hr/evaluations` - Crear evaluación
- `PUT /api/hr/evaluations/:id` - Actualizar evaluación
- `POST /api/hr/evaluations/:id/acknowledge` - Reconocer evaluación

### Capacitaciones
- `GET /api/hr/trainings` - Listar capacitaciones
- `GET /api/hr/trainings/:id` - Obtener capacitación
- `POST /api/hr/trainings` - Crear capacitación
- `POST /api/hr/trainings/:id/enroll` - Inscribir empleado
- `GET /api/hr/trainings/employee/:employeeId` - Por empleado

### Prestaciones Sociales
- `GET /api/hr/severance/employee/:employeeId` - Por empleado
- `POST /api/hr/severance/calculate` - Calcular mensual
- `POST /api/hr/severance/liquidate/:employeeId` - Liquidar

## Modelos de Base de Datos

- **Position** - Cargos/Posiciones
- **Employee** - Empleados
- **EmployeeDocument** - Documentos del empleado
- **Attendance** - Asistencia
- **VacationRequest** - Solicitudes de vacaciones
- **Leave** - Permisos y licencias
- **Payroll** - Nóminas
- **PayrollConcept** - Conceptos de nómina
- **PayrollDetail** - Detalles de nómina por empleado
- **PayrollDetailConcept** - Conceptos aplicados por empleado
- **PerformanceEvaluation** - Evaluaciones de desempeño
- **Training** - Capacitaciones
- **EmployeeTraining** - Relación empleado-capacitación
- **SeverancePayment** - Prestaciones sociales

## Validaciones

Todas las rutas incluyen validación de datos usando Zod schemas definidos en `validations.js`.

## Autenticación

Todas las rutas requieren autenticación mediante JWT. El middleware `authenticate` valida el token en cada petición.

## Próximos Pasos

- [ ] Implementar tests unitarios
- [ ] Implementar tests de integración
- [ ] Crear seeders para datos de prueba
- [ ] Desarrollar frontend del módulo
- [ ] Agregar generación de reportes PDF
- [ ] Implementar notificaciones por email
