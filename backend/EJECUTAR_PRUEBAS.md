# 🧪 Guía para Ejecutar las Pruebas del Módulo de Participación Ciudadana

## ✅ Pre-requisitos

Antes de ejecutar las pruebas, asegúrate de tener:

### 1. Base de Datos PostgreSQL Corriendo

Verifica que PostgreSQL esté activo:

```bash
# Verificar si PostgreSQL está corriendo
sudo systemctl status postgresql

# Si no está corriendo, iniciarlo
sudo systemctl start postgresql
```

### 2. Base de Datos Creada y Migrada

```bash
# Verificar conexión a la base de datos
cd /home/diazhh/dev/backend

# Generar cliente de Prisma
npx prisma generate

# Verificar estado de migraciones
npx prisma migrate status

# Si hay migraciones pendientes, aplicarlas
npx prisma migrate deploy
```

### 3. Usuarios de Prueba en la Base de Datos

Los tests requieren estos usuarios:

```bash
# Ejecutar el seed para crear usuarios de prueba
npx prisma db seed
```

**Usuarios necesarios:**
- `empleado@municipal.gob.ve` (rol: EMPLEADO) - Password: Admin123!
- `admin@municipal.gob.ve` (rol: ADMIN) - Password: Admin123!

## 🚀 Ejecutar las Pruebas

### Opción 1: Ejecutar TODAS las pruebas del módulo de Participación

```bash
cd /home/diazhh/dev/backend
npm test -- tests/integration/participation
```

### Opción 2: Ejecutar pruebas específicas

**Pruebas de Reportes Ciudadanos (311):**
```bash
npm test -- tests/integration/participation.reports.test.js
```

**Pruebas de Presupuesto Participativo:**
```bash
npm test -- tests/integration/participation.budget.test.js
```

**Pruebas de Portal de Transparencia:**
```bash
npm test -- tests/integration/participation.transparency.test.js
```

### Opción 3: Ejecutar con reporte de cobertura

```bash
npm test -- --coverage tests/integration/participation
```

### Opción 4: Ejecutar en modo watch (desarrollo)

```bash
npm test -- --watch tests/integration/participation
```

## 🔧 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Solución:**
```bash
# 1. Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# 2. Verificar credenciales en .env
cat /home/diazhh/dev/backend/.env | grep DATABASE_URL

# 3. Intentar conectar manualmente
psql postgresql://municipal_user:municipal_password@localhost:5432/municipal_db
```

### Error: "Prisma Client not generated"

**Solución:**
```bash
cd /home/diazhh/dev/backend
npx prisma generate
```

### Error: "User not found" durante login en tests

**Solución:**
```bash
# Ejecutar el seed para crear usuarios de prueba
cd /home/diazhh/dev/backend
npx prisma db seed
```

### Error: "Table does not exist"

**Solución:**
```bash
# Aplicar todas las migraciones
cd /home/diazhh/dev/backend
npx prisma migrate deploy

# O resetear la base de datos (¡CUIDADO: borra todos los datos!)
npx prisma migrate reset --force
```

### Error: Prisma panic "missing field enableTracing"

**Solución:**
```bash
# Actualizar Prisma a la última versión
cd /home/diazhh/dev/backend
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

## 📊 Interpretar los Resultados

### Salida Exitosa:
```
PASS  tests/integration/participation.reports.test.js
PASS  tests/integration/participation.budget.test.js
PASS  tests/integration/participation.transparency.test.js

Test Suites: 3 passed, 3 total
Tests:       50 passed, 50 total
Snapshots:   0 total
Time:        15.234 s
```

### Con Cobertura:
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.23 |    78.45 |   82.67 |   85.89 |
 participation/       |   88.45 |    82.34 |   86.23 |   89.12 |
  services/           |   90.12 |    85.67 |   88.45 |   91.23 |
  controllers/        |   86.78 |    79.23 |   84.56 |   87.45 |
----------------------|---------|----------|---------|---------|
```

## 🎯 Comando Rápido (Todo en Uno)

Si quieres ejecutar todo de una vez:

```bash
cd /home/diazhh/dev/backend && \
npx prisma generate && \
npx prisma migrate deploy && \
npm test -- tests/integration/participation
```

## 📝 Notas Importantes

1. **Los tests son destructivos:** Crean y eliminan datos de prueba. No ejecutar en base de datos de producción.

2. **Tiempo de ejecución:** Los tests completos toman ~15-20 segundos.

3. **Orden de ejecución:** Los tests se ejecutan en paralelo por defecto. Si hay problemas, ejecutar en serie:
   ```bash
   npm test -- --runInBand tests/integration/participation
   ```

4. **Logs detallados:** Para ver más información durante los tests:
   ```bash
   npm test -- --verbose tests/integration/participation
   ```

5. **Limpiar caché:** Si hay comportamientos extraños:
   ```bash
   npm test -- --clearCache
   ```

## ✅ Checklist Pre-Ejecución

Antes de ejecutar las pruebas, verifica:

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `municipal_db` existe
- [ ] Migraciones están aplicadas
- [ ] Usuarios de prueba existen
- [ ] Archivo `.env` tiene configuración correcta
- [ ] Dependencias instaladas (`npm install`)
- [ ] Prisma Client generado (`npx prisma generate`)

## 🆘 ¿Necesitas Ayuda?

Si los tests fallan después de seguir estos pasos:

1. Revisa los logs de error detalladamente
2. Verifica que todos los pre-requisitos estén cumplidos
3. Intenta ejecutar los tests uno por uno para identificar el problema
4. Revisa el archivo `tests/PARTICIPATION_TESTS_SUMMARY.md` para más detalles

## 🎉 ¡Éxito!

Si todos los tests pasan, el módulo de Participación Ciudadana está funcionando correctamente y listo para usar.
