# Tests de Integración - Módulo de Inventario y Bienes

## 📋 Descripción

Este archivo contiene tests de integración completos para el módulo de Inventario y Bienes Municipales (Fase 8). Los tests verifican el funcionamiento correcto de todos los servicios principales del módulo.

## 🧪 Cobertura de Tests

### 1. Assets Service (Bienes)
- ✅ Crear bien con código autogenerado
- ✅ Listar bienes con paginación
- ✅ Obtener bien por ID
- ✅ Actualizar bien
- ✅ Obtener estadísticas de bienes
- ✅ Cálculo de depreciación

### 2. Movements Service (Movimientos)
- ✅ Crear movimiento con acta autogenerada
- ✅ Aprobar movimiento
- ✅ Listar movimientos

### 3. Maintenances Service (Mantenimientos)
- ✅ Crear mantenimiento
- ✅ Iniciar mantenimiento
- ✅ Completar mantenimiento
- ✅ Obtener estadísticas de mantenimientos

### 4. Inventory Service (Inventario)
- ✅ Crear item con código autogenerado
- ✅ Crear entrada y actualizar stock
- ✅ Crear salida y validar stock
- ✅ Validar stock insuficiente
- ✅ Obtener estadísticas de inventario

### 5. Purchase Requests Service (Solicitudes de Compra)
- ✅ Crear solicitud con items
- ✅ Aprobar por jefe
- ✅ Aprobar por presupuesto
- ✅ Aprobar por compras
- ✅ Agregar cotización
- ✅ Obtener estadísticas de solicitudes

### 6. Validaciones
- ✅ Validar datos requeridos
- ✅ Validar entidades inexistentes

## 📊 Estadísticas

- **Total de Tests:** 26
- **Servicios Cubiertos:** 5
- **Funcionalidades Principales:** 100%

## 🚀 Cómo Ejecutar

```bash
# Ejecutar solo los tests de assets
npm test -- tests/integration/assets.integration.test.js

# Ejecutar todos los tests de integración
npm test -- tests/integration/

# Ejecutar con coverage
npm test -- --coverage tests/integration/assets.integration.test.js
```

## 📝 Notas Técnicas

### Estructura de los Tests

Los tests están organizados en bloques `describe` por servicio:

1. **Assets Service** - Gestión de bienes
2. **Movements Service** - Movimientos de bienes
3. **Maintenances Service** - Mantenimientos
4. **Inventory Service** - Control de inventario
5. **Purchase Requests Service** - Solicitudes de compra
6. **Validation Tests** - Validaciones y casos de error

### Datos de Prueba

Los tests crean datos de prueba que se limpian automáticamente en el `afterAll`:

- 1 bien de prueba (laptop)
- 1 movimiento de prueba
- 1 mantenimiento de prueba
- 1 item de inventario
- 1 entrada y 1 salida de inventario
- 1 solicitud de compra con items

### Validaciones Verificadas

1. **Códigos Autogenerados:**
   - Bienes: `BM-2025-XXXX`
   - Items: `INV-2025-XXXX`
   - Actas: `ACTA-2025-XXXX`
   - Entradas: `ENT-202501-XXXX`
   - Salidas: `SAL-202501-XXXX`
   - Solicitudes: `SOL-2025-XXXX`

2. **Cálculos:**
   - Depreciación mensual
   - Depreciación acumulada
   - Actualización de stock en entradas/salidas
   - Valoración de inventario

3. **Workflows:**
   - Aprobación de movimientos
   - Estados de mantenimientos
   - Flujo de aprobación de solicitudes de compra (4 niveles)

4. **Validaciones de Negocio:**
   - Stock insuficiente en salidas
   - Datos requeridos en creación
   - Entidades inexistentes

## ✅ Criterios de Aceptación Verificados

- [x] Generación automática de códigos únicos
- [x] Cálculo correcto de depreciación
- [x] Control de stock con validaciones
- [x] Workflow de aprobaciones multinivel
- [x] Actualización automática de estados
- [x] Trazabilidad completa de operaciones

## 🔧 Mantenimiento

Para agregar nuevos tests:

1. Agregar el test en el bloque `describe` correspondiente
2. Asegurar limpieza de datos en `afterAll`
3. Usar variables compartidas para IDs de entidades relacionadas
4. Seguir el patrón AAA (Arrange, Act, Assert)

## 📌 Próximos Pasos

- [ ] Agregar tests de rendimiento
- [ ] Agregar tests de concurrencia
- [ ] Agregar tests de límites y casos extremos
- [ ] Integrar con CI/CD para ejecución automática

---

**Archivo:** `/backend/tests/integration/assets.integration.test.js`  
**Última Actualización:** 11 de Octubre, 2025  
**Estado:** ✅ Completado
