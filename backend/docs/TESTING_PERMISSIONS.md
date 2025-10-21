# Guía de Pruebas del Sistema de Permisos

## Pruebas Manuales con cURL/Postman

### 1. Obtener Token de Autenticación

Primero, inicia sesión con diferentes usuarios para obtener sus tokens:

#### Super Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@municipal.gob.ve",
    "password": "Admin123!"
  }'
```

#### Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@municipal.gob.ve",
    "password": "Admin123!"
  }'
```

#### Director
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "director@municipal.gob.ve",
    "password": "Admin123!"
  }'
```

#### Empleado
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empleado@municipal.gob.ve",
    "password": "Admin123!"
  }'
```

#### Ciudadano
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ciudadano@example.com",
    "password": "Admin123!"
  }'
```

**Guarda el token** de la respuesta para usarlo en las siguientes pruebas.

### 2. Probar Endpoints de Administración

#### Obtener Mis Permisos (Cualquier usuario autenticado)
```bash
curl -X GET http://localhost:3001/api/admin/security/my-permissions \
  -H "Authorization: Bearer <TOKEN>"
```

**Resultado esperado**: Lista de módulos accesibles y permisos del usuario.

#### Obtener Matriz de Permisos (Solo ADMIN/SUPER_ADMIN)
```bash
curl -X GET http://localhost:3001/api/admin/security/permissions \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

**Resultado esperado**: Matriz completa de módulos, acciones y roles.

#### Obtener Permisos de un Rol (Solo ADMIN/SUPER_ADMIN)
```bash
curl -X GET http://localhost:3001/api/admin/security/permissions/DIRECTOR \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

**Resultado esperado**: Módulos accesibles y permisos del rol DIRECTOR.

#### Intentar con Usuario No Autorizado (Debe Fallar)
```bash
curl -X GET http://localhost:3001/api/admin/security/permissions \
  -H "Authorization: Bearer <TOKEN_EMPLEADO>"
```

**Resultado esperado**: Error 403 - Acceso denegado.

### 3. Verificar Logging de Accesos Denegados

#### Intentar Acceso No Autorizado
```bash
# Empleado intentando acceder a permisos (debe fallar)
curl -X GET http://localhost:3001/api/admin/security/permissions \
  -H "Authorization: Bearer <TOKEN_EMPLEADO>"
```

#### Consultar Logs de Accesos Denegados (Como ADMIN)
```bash
curl -X GET http://localhost:3001/api/admin/security/access-denied?limit=10 \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

**Resultado esperado**: Lista de intentos de acceso denegados, incluyendo el intento anterior.

#### Obtener Estadísticas de Accesos Denegados
```bash
curl -X GET http://localhost:3001/api/admin/security/access-denied/stats \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

**Resultado esperado**: Estadísticas agrupadas por rol, módulo, acción y usuario.

### 4. Probar Diferentes Niveles de Acceso

#### Test 1: EMPLEADO no puede ver logs (403)
```bash
curl -X GET http://localhost:3001/api/admin/security/access-denied \
  -H "Authorization: Bearer <TOKEN_EMPLEADO>"
```

#### Test 2: DIRECTOR no puede ver logs (403)
```bash
curl -X GET http://localhost:3001/api/admin/security/access-denied \
  -H "Authorization: Bearer <TOKEN_DIRECTOR>"
```

#### Test 3: ADMIN puede ver logs (200)
```bash
curl -X GET http://localhost:3001/api/admin/security/access-denied \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

#### Test 4: SUPER_ADMIN puede limpiar logs (200)
```bash
curl -X DELETE http://localhost:3001/api/admin/security/access-denied \
  -H "Authorization: Bearer <TOKEN_SUPERADMIN>"
```

#### Test 5: ADMIN no puede limpiar logs (403)
```bash
curl -X DELETE http://localhost:3001/api/admin/security/access-denied \
  -H "Authorization: Bearer <TOKEN_ADMIN>"
```

## Casos de Prueba Automatizados

### Archivo de Test: `tests/permissions.integration.test.js`

```javascript
import request from 'supertest';
import app from '../src/server.js';
import { MODULES, ACTIONS, ROLES } from '../src/shared/constants/permissions.js';

describe('Sistema de Permisos - Integración', () => {
  let tokens = {};
  
  beforeAll(async () => {
    // Obtener tokens para todos los roles
    const users = [
      { email: 'superadmin@municipal.gob.ve', password: 'Admin123!', role: 'SUPER_ADMIN' },
      { email: 'admin@municipal.gob.ve', password: 'Admin123!', role: 'ADMIN' },
      { email: 'director@municipal.gob.ve', password: 'Admin123!', role: 'DIRECTOR' },
      { email: 'empleado@municipal.gob.ve', password: 'Admin123!', role: 'EMPLEADO' },
      { email: 'ciudadano@example.com', password: 'Admin123!', role: 'CIUDADANO' },
    ];
    
    for (const user of users) {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: user.password });
      
      tokens[user.role] = response.body.token;
    }
  });
  
  describe('Endpoints de Administración', () => {
    test('SUPER_ADMIN puede acceder a matriz de permisos', async () => {
      const response = await request(app)
        .get('/api/admin/security/permissions')
        .set('Authorization', `Bearer ${tokens.SUPER_ADMIN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('modules');
      expect(response.body.data).toHaveProperty('actions');
      expect(response.body.data).toHaveProperty('roles');
    });
    
    test('ADMIN puede acceder a matriz de permisos', async () => {
      const response = await request(app)
        .get('/api/admin/security/permissions')
        .set('Authorization', `Bearer ${tokens.ADMIN}`);
      
      expect(response.status).toBe(200);
    });
    
    test('EMPLEADO NO puede acceder a matriz de permisos', async () => {
      const response = await request(app)
        .get('/api/admin/security/permissions')
        .set('Authorization', `Bearer ${tokens.EMPLEADO}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    test('Cualquier usuario puede ver sus propios permisos', async () => {
      const response = await request(app)
        .get('/api/admin/security/my-permissions')
        .set('Authorization', `Bearer ${tokens.EMPLEADO}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data).toHaveProperty('accessibleModules');
      expect(response.body.data).toHaveProperty('permissions');
    });
  });
  
  describe('Logs de Accesos Denegados', () => {
    test('ADMIN puede ver logs de accesos denegados', async () => {
      const response = await request(app)
        .get('/api/admin/security/access-denied')
        .set('Authorization', `Bearer ${tokens.ADMIN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('EMPLEADO NO puede ver logs', async () => {
      const response = await request(app)
        .get('/api/admin/security/access-denied')
        .set('Authorization', `Bearer ${tokens.EMPLEADO}`);
      
      expect(response.status).toBe(403);
    });
    
    test('Solo SUPER_ADMIN puede limpiar logs', async () => {
      // ADMIN intenta limpiar (debe fallar)
      let response = await request(app)
        .delete('/api/admin/security/access-denied')
        .set('Authorization', `Bearer ${tokens.ADMIN}`);
      
      expect(response.status).toBe(403);
      
      // SUPER_ADMIN limpia (debe funcionar)
      response = await request(app)
        .delete('/api/admin/security/access-denied')
        .set('Authorization', `Bearer ${tokens.SUPER_ADMIN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('Acceso denegado se registra en logs', async () => {
      // Intentar acceso no autorizado
      await request(app)
        .get('/api/admin/security/permissions')
        .set('Authorization', `Bearer ${tokens.EMPLEADO}`);
      
      // Verificar que se registró
      const response = await request(app)
        .get('/api/admin/security/access-denied?limit=1')
        .set('Authorization', `Bearer ${tokens.ADMIN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const lastLog = response.body.data[0];
      expect(lastLog.role).toBe('EMPLEADO');
      expect(lastLog.email).toBe('empleado@municipal.gob.ve');
    });
  });
  
  describe('Estadísticas de Accesos Denegados', () => {
    test('ADMIN puede obtener estadísticas', async () => {
      const response = await request(app)
        .get('/api/admin/security/access-denied/stats')
        .set('Authorization', `Bearer ${tokens.ADMIN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byRole');
      expect(response.body.data).toHaveProperty('byModule');
      expect(response.body.data).toHaveProperty('byAction');
    });
  });
});
```

## Ejecutar Tests

```bash
# Instalar dependencias de testing
cd backend
npm install --save-dev jest supertest

# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar solo tests de permisos
npm test -- permissions
```

## Verificación Manual del Archivo de Logs

```bash
# Ver logs de accesos denegados
cat backend/logs/access-denied.log

# Ver últimas 10 líneas
tail -n 10 backend/logs/access-denied.log

# Buscar intentos de un usuario específico
grep "empleado@municipal.gob.ve" backend/logs/access-denied.log

# Contar intentos por rol
grep -o '"role":"[^"]*"' backend/logs/access-denied.log | sort | uniq -c
```

## Checklist de Verificación

- [ ] Todos los usuarios pueden iniciar sesión correctamente
- [ ] Cada usuario puede ver sus propios permisos
- [ ] ADMIN y SUPER_ADMIN pueden ver la matriz de permisos
- [ ] EMPLEADO recibe 403 al intentar acceder a endpoints de admin
- [ ] Los accesos denegados se registran en el archivo de logs
- [ ] ADMIN puede consultar logs de accesos denegados
- [ ] Solo SUPER_ADMIN puede limpiar los logs
- [ ] Las estadísticas muestran datos correctos
- [ ] Los permisos por rol coinciden con la matriz definida
- [ ] El sistema registra IP, user agent y timestamp en los logs

## Troubleshooting

### Error: "Token no proporcionado"
- Verifica que estás enviando el header `Authorization: Bearer <token>`
- Asegúrate de que el token no tenga espacios adicionales

### Error: "Usuario no encontrado"
- Verifica que la base de datos esté poblada con el seed
- Ejecuta: `npm run seed`

### Error: "Cannot read property 'role' of undefined"
- El token puede estar expirado
- Obtén un nuevo token haciendo login nuevamente

### Los logs no se están guardando
- Verifica que existe el directorio `backend/logs/`
- Verifica permisos de escritura en el directorio
- Revisa la consola para errores del logger
