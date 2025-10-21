# Sistema de Permisos Granulares

## Descripción General

El sistema implementa un **Control de Acceso Basado en Roles (RBAC)** con permisos granulares por módulo y acción. Esto garantiza que cada usuario solo pueda acceder a las funcionalidades autorizadas según su rol.

## Roles del Sistema

| Rol | Descripción | Nivel de Acceso |
|-----|-------------|-----------------|
| `SUPER_ADMIN` | Super Administrador | Acceso total a todos los módulos y acciones |
| `ADMIN` | Administrador General | Acceso amplio con capacidad de gestión |
| `DIRECTOR` | Director de Departamento | Acceso a módulos de su área con permisos de aprobación |
| `COORDINADOR` | Coordinador de Área | Acceso a módulos operativos con permisos limitados |
| `EMPLEADO` | Empleado Regular | Acceso de lectura y actualización básica |
| `CIUDADANO` | Ciudadano | Acceso limitado a módulos de participación ciudadana |

## Módulos del Sistema

El sistema está dividido en los siguientes módulos:

### Core
- `auth` - Autenticación
- `users` - Gestión de Usuarios

### Estructura Organizacional
- `departments` - Departamentos
- `positions` - Cargos

### Proyectos
- `projects` - Proyectos
- `tasks` - Tareas

### Finanzas
- `budgets` - Presupuestos
- `expenses` - Gastos
- `income` - Ingresos

### Recursos Humanos
- `employees` - Empleados
- `payroll` - Nómina
- `attendance` - Asistencia

### Tributario
- `taxes` - Impuestos
- `tax_payers` - Contribuyentes

### Catastro
- `properties` - Propiedades
- `cadastre` - Catastro

### Participación Ciudadana
- `petitions` - Peticiones
- `complaints` - Denuncias
- `suggestions` - Sugerencias

### Gestión de Flota
- `vehicles` - Vehículos
- `maintenance` - Mantenimiento

### Inventario de Bienes
- `assets` - Activos
- `inventory` - Inventario

### Gestión Documental
- `documents` - Documentos
- `archives` - Archivos

### Servicios Públicos
- `public_services` - Servicios Públicos
- `service_requests` - Solicitudes de Servicio

### Dashboards
- `dashboards` - Dashboards
- `reports` - Reportes

## Acciones Disponibles

| Acción | Descripción |
|--------|-------------|
| `create` | Crear nuevos registros |
| `read` | Leer/consultar registros |
| `update` | Actualizar registros existentes |
| `delete` | Eliminar registros |
| `approve` | Aprobar solicitudes/registros |
| `reject` | Rechazar solicitudes/registros |
| `export` | Exportar datos |
| `import` | Importar datos |
| `manage` | Acciones administrativas completas |

## Uso en el Código

### 1. Importar el Sistema de Permisos

```javascript
import { 
  MODULES, 
  ACTIONS, 
  hasPermission,
  requirePermission,
  requireModuleAccess 
} from '../shared/constants/permissions.js';
```

### 2. Proteger Rutas con Permisos Granulares

#### Opción A: Verificar Permiso Específico

```javascript
import { authenticate, requirePermission } from '../shared/middlewares/auth.middleware.js';
import { MODULES, ACTIONS } from '../shared/constants/permissions.js';

// Solo usuarios con permiso para CREAR proyectos pueden acceder
router.post(
  '/projects',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.CREATE),
  projectController.create
);
```

#### Opción B: Verificar Acceso al Módulo

```javascript
import { authenticate, requireModuleAccess } from '../shared/middlewares/auth.middleware.js';
import { MODULES } from '../shared/constants/permissions.js';

// Solo usuarios con acceso al módulo de proyectos
router.get(
  '/projects',
  authenticate,
  requireModuleAccess(MODULES.PROJECTS),
  projectController.list
);
```

#### Opción C: Verificar por Roles (Método Tradicional)

```javascript
import { authenticate, authorize } from '../shared/middlewares/auth.middleware.js';

// Solo ADMIN y SUPER_ADMIN
router.delete(
  '/users/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  userController.delete
);
```

### 3. Verificar Permisos en Controladores

```javascript
import { hasPermission } from '../shared/constants/permissions.js';
import { MODULES, ACTIONS } from '../shared/constants/permissions.js';

class ProjectController {
  async update(req, res, next) {
    try {
      const { role } = req.user;
      
      // Verificar si el usuario puede aprobar
      const canApprove = hasPermission(role, MODULES.PROJECTS, ACTIONS.APPROVE);
      
      if (req.body.status === 'approved' && !canApprove) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para aprobar proyectos'
        });
      }
      
      // Continuar con la lógica...
    } catch (error) {
      next(error);
    }
  }
}
```

### 4. Obtener Permisos de un Usuario

```javascript
import { getModulePermissions, getAccessibleModules } from '../shared/constants/permissions.js';

// Obtener módulos accesibles para un rol
const modules = getAccessibleModules('DIRECTOR');
// ['auth', 'users', 'departments', 'projects', ...]

// Obtener permisos en un módulo específico
const permissions = getModulePermissions('DIRECTOR', MODULES.PROJECTS);
// ['create', 'read', 'update', 'approve', 'export']
```

## Endpoints de Administración

### Consultar Logs de Acceso Denegado

```bash
GET /api/admin/security/access-denied?limit=100
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-10-10T21:30:00.000Z",
      "userId": "abc-123",
      "email": "empleado@municipal.gob.ve",
      "role": "EMPLEADO",
      "module": "budgets",
      "action": "create",
      "ip": "192.168.1.100",
      "path": "/api/budgets",
      "method": "POST"
    }
  ],
  "total": 1
}
```

### Obtener Estadísticas de Accesos Denegados

```bash
GET /api/admin/security/access-denied/stats
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byRole": {
      "EMPLEADO": 30,
      "COORDINADOR": 10,
      "CIUDADANO": 5
    },
    "byModule": {
      "budgets": 20,
      "users": 15,
      "payroll": 10
    },
    "byAction": {
      "create": 25,
      "delete": 15,
      "approve": 5
    }
  }
}
```

### Obtener Matriz de Permisos

```bash
GET /api/admin/security/permissions
Authorization: Bearer <token>
```

### Obtener Permisos de un Rol

```bash
GET /api/admin/security/permissions/DIRECTOR
Authorization: Bearer <token>
```

### Obtener Mis Permisos

```bash
GET /api/admin/security/my-permissions
Authorization: Bearer <token>
```

## Logging de Accesos Denegados

Todos los intentos de acceso denegado se registran automáticamente en:

- **Archivo**: `backend/logs/access-denied.log`
- **Formato**: JSON (una línea por evento)
- **Información registrada**:
  - Timestamp
  - Usuario (ID, email, rol)
  - Módulo y acción intentados
  - IP y User Agent
  - Ruta y método HTTP

### Ejemplo de Log

```json
{"timestamp":"2025-10-10T21:30:00.000Z","userId":"abc-123","email":"empleado@municipal.gob.ve","role":"EMPLEADO","module":"budgets","action":"create","ip":"192.168.1.100","userAgent":"Mozilla/5.0...","path":"/api/budgets","method":"POST"}
```

## Mejores Prácticas

### ✅ DO

1. **Siempre usar permisos granulares** para rutas sensibles:
   ```javascript
   router.post('/budgets', authenticate, requirePermission(MODULES.BUDGETS, ACTIONS.CREATE), ...)
   ```

2. **Combinar autenticación con autorización**:
   ```javascript
   router.get('/projects', authenticate, requireModuleAccess(MODULES.PROJECTS), ...)
   ```

3. **Verificar permisos en la lógica de negocio** cuando sea necesario:
   ```javascript
   if (!hasPermission(user.role, MODULES.PROJECTS, ACTIONS.APPROVE)) {
     throw new AuthorizationError('No puede aprobar proyectos');
   }
   ```

4. **Usar constantes** en lugar de strings:
   ```javascript
   // ✅ Correcto
   requirePermission(MODULES.PROJECTS, ACTIONS.CREATE)
   
   // ❌ Incorrecto
   requirePermission('projects', 'create')
   ```

### ❌ DON'T

1. **No dejar rutas sin protección**:
   ```javascript
   // ❌ Peligroso
   router.delete('/users/:id', userController.delete);
   
   // ✅ Correcto
   router.delete('/users/:id', authenticate, authorize('SUPER_ADMIN'), userController.delete);
   ```

2. **No confiar solo en el frontend** para control de acceso

3. **No hardcodear roles** en múltiples lugares:
   ```javascript
   // ❌ Incorrecto
   if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') { ... }
   
   // ✅ Correcto
   if (hasPermission(user.role, module, action)) { ... }
   ```

## Modificar Permisos

Para modificar la matriz de permisos, edita el archivo:

```
backend/src/shared/constants/permissions.js
```

Ejemplo de cómo agregar un nuevo módulo:

```javascript
export const MODULES = {
  // ... módulos existentes
  NEW_MODULE: 'new_module',
};

export const PERMISSIONS = {
  // ... permisos existentes
  [MODULES.NEW_MODULE]: {
    [ROLES.SUPER_ADMIN]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [ROLES.ADMIN]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [ROLES.DIRECTOR]: [ACTIONS.READ, ACTIONS.UPDATE],
    [ROLES.COORDINADOR]: [ACTIONS.READ],
    [ROLES.EMPLEADO]: [ACTIONS.READ],
    [ROLES.CIUDADANO]: [],
  },
};
```

## Testing

Ejemplo de test para verificar permisos:

```javascript
import { hasPermission } from '../src/shared/constants/permissions.js';
import { MODULES, ACTIONS, ROLES } from '../src/shared/constants/permissions.js';

describe('Sistema de Permisos', () => {
  test('SUPER_ADMIN tiene acceso a todo', () => {
    expect(hasPermission(ROLES.SUPER_ADMIN, MODULES.BUDGETS, ACTIONS.DELETE)).toBe(true);
  });
  
  test('EMPLEADO no puede crear presupuestos', () => {
    expect(hasPermission(ROLES.EMPLEADO, MODULES.BUDGETS, ACTIONS.CREATE)).toBe(false);
  });
  
  test('DIRECTOR puede aprobar proyectos', () => {
    expect(hasPermission(ROLES.DIRECTOR, MODULES.PROJECTS, ACTIONS.APPROVE)).toBe(true);
  });
});
```

## Soporte

Para dudas o problemas con el sistema de permisos, consulta:

- Código fuente: `backend/src/shared/constants/permissions.js`
- Middlewares: `backend/src/shared/middlewares/auth.middleware.js`
- Logger: `backend/src/shared/utils/access-logger.js`
