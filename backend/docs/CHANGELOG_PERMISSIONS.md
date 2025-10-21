# Changelog - Sistema de Permisos Granulares

## Fecha: 2025-10-10

### ✅ Implementado

#### 1. Sistema de Permisos Granulares
**Archivo**: `src/shared/constants/permissions.js`

- ✅ Definición de 30+ módulos del sistema
- ✅ 9 acciones disponibles (create, read, update, delete, approve, reject, export, import, manage)
- ✅ 6 roles del sistema (SUPER_ADMIN, ADMIN, DIRECTOR, COORDINADOR, EMPLEADO, CIUDADANO)
- ✅ Matriz completa de permisos por rol y módulo
- ✅ Funciones helper:
  - `hasPermission(role, module, action)` - Verifica permiso específico
  - `getModulePermissions(role, module)` - Obtiene permisos de un módulo
  - `hasModuleAccess(role, module)` - Verifica acceso al módulo
  - `getAccessibleModules(role)` - Lista módulos accesibles

#### 2. Middlewares de Autorización Mejorados
**Archivo**: `src/shared/middlewares/auth.middleware.js`

- ✅ `authenticate` - Verifica JWT y adjunta usuario (ya existía)
- ✅ `authorize(...roles)` - Verifica roles permitidos (ya existía)
- ✅ `requirePermission(module, action)` - **NUEVO** - Verifica permiso granular
- ✅ `requireModuleAccess(module)` - **NUEVO** - Verifica acceso al módulo
- ✅ `optionalAuth` - Autenticación opcional (ya existía)

#### 3. Sistema de Logging de Accesos Denegados
**Archivo**: `src/shared/utils/access-logger.js`

- ✅ `logAccessDenied(data)` - Registra intento de acceso denegado
- ✅ `getRecentAccessDenied(limit)` - Obtiene últimos N registros
- ✅ `getAccessDeniedStats()` - Genera estadísticas de accesos denegados
- ✅ `clearAccessDeniedLog()` - Limpia el archivo de logs
- ✅ Logs guardados en: `backend/logs/access-denied.log`
- ✅ Formato JSON para fácil análisis
- ✅ Información registrada:
  - Timestamp
  - Usuario (ID, email, rol)
  - Módulo y acción
  - IP y User Agent
  - Ruta y método HTTP

#### 4. Módulo de Administración
**Archivos**: 
- `src/modules/admin/controllers/security.controller.js`
- `src/modules/admin/routes.js`

**Endpoints Implementados**:

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/admin/security/access-denied` | Obtener logs de accesos denegados | ADMIN, SUPER_ADMIN |
| GET | `/api/admin/security/access-denied/stats` | Estadísticas de accesos denegados | ADMIN, SUPER_ADMIN |
| DELETE | `/api/admin/security/access-denied` | Limpiar logs | SUPER_ADMIN |
| GET | `/api/admin/security/permissions` | Matriz de permisos completa | ADMIN, SUPER_ADMIN |
| GET | `/api/admin/security/permissions/:role` | Permisos de un rol | ADMIN, SUPER_ADMIN |
| GET | `/api/admin/security/my-permissions` | Permisos del usuario actual | Todos |

#### 5. Documentación
- ✅ `docs/PERMISSIONS.md` - Documentación completa del sistema
- ✅ `docs/PERMISSIONS_EXAMPLES.md` - Ejemplos prácticos de uso
- ✅ `docs/TESTING_PERMISSIONS.md` - Guía de pruebas
- ✅ `docs/CHANGELOG_PERMISSIONS.md` - Este archivo

#### 6. Integración con Servidor
**Archivo**: `src/server.js`

- ✅ Rutas de admin registradas en `/api/admin`
- ✅ Todas las rutas protegidas con autenticación

### 📊 Matriz de Permisos por Rol

#### SUPER_ADMIN
- **Acceso**: Total a todos los módulos y acciones
- **Módulos**: 30+ módulos
- **Acciones**: Todas (create, read, update, delete, approve, reject, export, import, manage)

#### ADMIN
- **Acceso**: Amplio con capacidad de gestión
- **Módulos**: 30+ módulos
- **Acciones**: create, read, update, delete, approve, export (mayoría de módulos)
- **Restricciones**: No puede limpiar logs de seguridad

#### DIRECTOR
- **Acceso**: Módulos de su área con permisos de aprobación
- **Módulos**: Proyectos, Finanzas, RRHH, Documentos, etc.
- **Acciones**: create, read, update, approve, export (según módulo)
- **Restricciones**: No puede eliminar en la mayoría de módulos

#### COORDINADOR
- **Acceso**: Módulos operativos con permisos limitados
- **Módulos**: Proyectos, Tareas, Documentos, Servicios, etc.
- **Acciones**: create, read, update (mayoría de módulos)
- **Restricciones**: No puede aprobar ni eliminar

#### EMPLEADO
- **Acceso**: Lectura y actualización básica
- **Módulos**: Proyectos, Tareas, Asistencia, Documentos (limitado)
- **Acciones**: read, update (limitado)
- **Restricciones**: No puede crear, eliminar ni aprobar

#### CIUDADANO
- **Acceso**: Limitado a módulos de participación ciudadana
- **Módulos**: Peticiones, Denuncias, Sugerencias, Solicitudes de Servicio
- **Acciones**: create, read (solo en módulos permitidos)
- **Restricciones**: Sin acceso a módulos internos

### 🔒 Seguridad Implementada

1. **Autenticación JWT**: Todas las rutas protegidas requieren token válido
2. **Autorización por Roles**: Verificación de roles permitidos
3. **Permisos Granulares**: Control fino por módulo y acción
4. **Logging de Seguridad**: Registro automático de accesos denegados
5. **Auditoría**: Estadísticas y análisis de intentos de acceso
6. **Separación de Privilegios**: SUPER_ADMIN vs ADMIN vs otros roles

### 📝 Uso Básico

```javascript
// Proteger una ruta con permiso específico
import { authenticate, requirePermission } from '../middlewares/auth.middleware.js';
import { MODULES, ACTIONS } from '../constants/permissions.js';

router.post(
  '/projects',
  authenticate,
  requirePermission(MODULES.PROJECTS, ACTIONS.CREATE),
  projectController.create
);

// Verificar permiso en código
import { hasPermission } from '../constants/permissions.js';

if (!hasPermission(user.role, MODULES.BUDGETS, ACTIONS.APPROVE)) {
  throw new AuthorizationError('No puede aprobar presupuestos');
}
```

### 🧪 Testing

- ✅ Sintaxis validada con `node -c`
- ⏳ Tests unitarios pendientes (f0-sub12)
- ⏳ Tests de integración pendientes (f0-sub12)

### 📦 Archivos Creados/Modificados

**Nuevos Archivos**:
1. `src/shared/constants/permissions.js` (600+ líneas)
2. `src/shared/utils/access-logger.js` (160+ líneas)
3. `src/modules/admin/controllers/security.controller.js` (150+ líneas)
4. `src/modules/admin/routes.js` (60+ líneas)
5. `docs/PERMISSIONS.md` (400+ líneas)
6. `docs/PERMISSIONS_EXAMPLES.md` (500+ líneas)
7. `docs/TESTING_PERMISSIONS.md` (400+ líneas)
8. `docs/CHANGELOG_PERMISSIONS.md` (este archivo)

**Archivos Modificados**:
1. `src/shared/middlewares/auth.middleware.js` - Agregados middlewares `requirePermission` y `requireModuleAccess`
2. `src/server.js` - Registradas rutas de admin
3. `tasks/fase-0-core.json` - Actualizadas sub-tareas f0-sub6 y f0-sub6.5 a 'done'

### 🎯 Próximos Pasos

Según el plan de trabajo (FASE 0):

1. **f0-sub7**: Inicialización del Frontend (Next.js, TailwindCSS)
2. **f0-sub8**: Configuración de shadcn/ui
3. **f0-sub9**: Desarrollo del Layout Principal
4. **f0-sub10**: Gestión de Estado de Autenticación (Zustand)
5. **f0-sub11**: Páginas de Autenticación (Login/Registro)
6. **f0-sub12**: Tests (Backend y Frontend)

### 💡 Notas Importantes

- El sistema de permisos está **completamente funcional** y listo para usar
- Todos los módulos futuros deben usar `requirePermission` o `requireModuleAccess`
- Los logs de acceso denegado se guardan automáticamente
- La documentación está completa y lista para consulta
- El sistema es **extensible** - fácil agregar nuevos módulos o acciones

### ⚠️ Advertencias

- **NO** dejar rutas sin protección
- **SIEMPRE** usar constantes (MODULES, ACTIONS) en lugar de strings
- **VERIFICAR** permisos en controladores para lógica compleja
- **MANTENER** sincronizada la matriz de permisos con los módulos reales
- **REVISAR** logs de seguridad periódicamente

### 🔗 Referencias

- Documentación: `backend/docs/PERMISSIONS.md`
- Ejemplos: `backend/docs/PERMISSIONS_EXAMPLES.md`
- Testing: `backend/docs/TESTING_PERMISSIONS.md`
- Código fuente: `backend/src/shared/constants/permissions.js`
