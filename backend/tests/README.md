# Tests del Backend

Este directorio contiene todos los tests del backend del Sistema Integral de Gestión Municipal.

## Estructura

```
tests/
├── unit/              # Tests unitarios
│   ├── helpers.test.js
│   ├── jwt.test.js
│   ├── projectService.test.js
│   ├── departments/
│   │   └── department.service.test.js
│   └── hr/           # Tests del módulo de RRHH
│       ├── employee.service.test.js
│       ├── payroll.service.test.js
│       ├── vacation.service.test.js
│       └── attendance.service.test.js
├── integration/       # Tests de integración
│   ├── auth.integration.test.js
│   ├── departments.test.js
│   ├── projects.test.js
│   └── hr.integration.test.js
├── setup.js          # Configuración global de tests
└── README.md         # Este archivo
```

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests en modo watch
```bash
npm run test:watch
```

### Tests con coverage
```bash
npm run test:coverage
```

### Tests específicos
```bash
# Solo tests unitarios
npm test -- --testPathPattern=unit

# Solo tests de integración
npm test -- --testPathPattern=integration

# Un archivo específico
npm test -- auth.integration.test.js
```

## Cobertura Actual

- **Total**: ~51%
- **Statements**: 51.27%
- **Branches**: 27.7%
- **Functions**: 39.77%
- **Lines**: 51.42%

### Módulos Cubiertos

✅ **Módulo de Autenticación** (Alta cobertura)
- Servicios: 88.88%
- Controladores: 89.28%
- Rutas: 100%
- Validaciones: 100%

✅ **Utilidades** (Cobertura parcial)
- Helpers: 72.72%
- JWT: 100%
- Response: 100%

⚠️ **Pendientes de Mayor Cobertura**
- Módulo de Admin (0%)
- Middlewares de autorización (40%)
- Manejo de errores (50%)

## Tipos de Tests

### Tests Unitarios

Los tests unitarios verifican funciones individuales y lógica de negocio aislada:

- **helpers.test.js**: Funciones auxiliares (sanitizeObject, generateSlug, etc.)
- **jwt.test.js**: Generación y verificación de tokens JWT

### Tests de Integración

Los tests de integración verifican el flujo completo de las APIs:

- **auth.integration.test.js**: 
  - Registro de usuarios
  - Login
  - Gestión de perfil
  - Cambio de contraseña
  - Autenticación con JWT

## Convenciones

### Nomenclatura
- Archivos de test: `*.test.js` o `*.spec.js`
- Tests unitarios en `/tests/unit/`
- Tests de integración en `/tests/integration/`

### Estructura de Tests
```javascript
describe('Módulo o Funcionalidad', () => {
  beforeAll(() => {
    // Setup que se ejecuta una vez antes de todos los tests
  });

  beforeEach(() => {
    // Setup que se ejecuta antes de cada test
  });

  afterEach(() => {
    // Cleanup después de cada test
  });

  afterAll(() => {
    // Cleanup final después de todos los tests
  });

  describe('Caso de uso específico', () => {
    it('debe hacer algo específico', async () => {
      // Arrange (preparar)
      const input = 'test';

      // Act (ejecutar)
      const result = someFunction(input);

      // Assert (verificar)
      expect(result).toBe('expected');
    });
  });
});
```

### Assertions Comunes
```javascript
// Igualdad
expect(value).toBe(expected);
expect(object).toEqual(expected);

// Propiedades
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', value);

// Negaciones
expect(value).not.toBe(unexpected);

// Errores
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(ErrorType);
expect(() => fn()).toThrow('error message');

// Async/Await
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();

// HTTP Status
expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
```

## Tests de Integración con Supertest

```javascript
import request from 'supertest';
import app from '../src/server.js';

// GET request
const response = await request(app)
  .get('/api/endpoint')
  .set('Authorization', `Bearer ${token}`);

// POST request
const response = await request(app)
  .post('/api/endpoint')
  .send({ data: 'value' });

// Verificaciones
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('data');
```

## Base de Datos en Tests

Los tests de integración usan la base de datos real en modo test:

1. **Setup**: Se crean datos de prueba en `beforeAll`
2. **Cleanup**: Se eliminan datos de prueba en `afterAll`
3. **Aislamiento**: Cada suite de tests limpia sus propios datos

### Datos de Prueba

Los tests usan emails con prefijo `test-` para facilitar la limpieza:

```javascript
await prisma.user.deleteMany({
  where: {
    email: {
      contains: 'test-',
    },
  },
});
```

## Variables de Entorno

Las variables de entorno para testing se configuran en `tests/setup.js`:

```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
```

## Mejores Prácticas

1. **Independencia**: Cada test debe ser independiente y no depender del orden de ejecución
2. **Cleanup**: Siempre limpiar datos de prueba después de los tests
3. **Descriptivo**: Nombres de tests claros que describan qué se está probando
4. **AAA Pattern**: Arrange, Act, Assert
5. **Un concepto por test**: Cada test debe verificar una sola cosa
6. **Datos realistas**: Usar datos que reflejen casos de uso reales

## Próximos Pasos

Para alcanzar el objetivo de 70% de coverage:

1. Agregar tests para el módulo de Admin
2. Mejorar coverage de middlewares de autorización
3. Agregar tests para manejo de errores edge cases
4. Implementar tests para futuros módulos (Proyectos, Finanzas, etc.)

## Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
