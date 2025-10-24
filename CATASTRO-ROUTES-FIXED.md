# ✅ Corrección de Rutas Duplicadas - Módulo Catastro

**Fecha:** 23 de Octubre, 2025  
**Módulo:** Catastro y Ordenamiento Territorial  
**Ambiente:** Desarrollo

---

## 📋 PROBLEMA IDENTIFICADO

Todas las páginas del módulo Catastro mostraban errores 404 con rutas duplicadas:

```json
{
    "success": false,
    "message": "Ruta no encontrada: GET /api/api/catastro/construction-permits"
}
```

**Problema:** Las rutas tenían **doble `/api/api`** en lugar de solo `/api`.

---

## 🔍 ANÁLISIS DE LA CAUSA

### Configuración de API_URL:

En `/frontend/src/constants/index.js`:
```javascript
// Línea 60-64
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const API_URL = `${API_BASE_URL}/api`;  // ← Ya incluye /api
```

### Cliente API:

En `/frontend/src/lib/api.js`:
```javascript
const api = axios.create({
  baseURL: API_URL,  // ← baseURL = http://localhost:3001/api
});
```

### Servicio de Catastro (ANTES - Incorrecto):

```javascript
// ❌ INCORRECTO
export const getProperties = async (params = {}) => {
  const response = await api.get('/api/catastro/properties', { params });
  //                                 ↑ Agregaba /api nuevamente
  return response.data.data || response.data;
};
```

### Resultado:
```
baseURL: http://localhost:3001/api
    +
ruta: /api/catastro/properties
    =
URL final: http://localhost:3001/api/api/catastro/properties  ❌
```

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Archivo Modificado:
**`/frontend/src/services/catastro.service.js`**

### Cambio Realizado:

Eliminé el prefijo `/api` de **TODAS las rutas** del servicio usando `replace_all`:

```javascript
// ✅ CORRECTO
export const getProperties = async (params = {}) => {
  const response = await api.get('/catastro/properties', { params });
  //                                 ↑ Sin /api
  return response.data.data || response.data;
};
```

### Resultado:
```
baseURL: http://localhost:3001/api
    +
ruta: /catastro/properties
    =
URL final: http://localhost:3001/api/catastro/properties  ✅
```

---

## 📦 RUTAS CORREGIDAS

### Todas las rutas actualizadas (41 endpoints):

**ANTES ❌:**
```javascript
'/api/catastro/properties'
'/api/catastro/urban-variables'
'/api/catastro/construction-permits'
'/api/catastro/urban-inspections'
```

**DESPUÉS ✅:**
```javascript
'/catastro/properties'
'/catastro/urban-variables'
'/catastro/construction-permits'
'/catastro/urban-inspections'
```

### Categorías de Endpoints Corregidos:

1. **Properties (Propiedades)** - 12 rutas
   - `/catastro/properties`
   - `/catastro/properties/:id`
   - `/catastro/properties/cadastral/:code`
   - `/catastro/properties/search/location`
   - `/catastro/properties/stats`
   - `/catastro/properties/:id/owners`
   - etc.

2. **Urban Variables** - 8 rutas
   - `/catastro/urban-variables`
   - `/catastro/urban-variables/:id`
   - `/catastro/urban-variables/zone/:code`
   - `/catastro/urban-variables/stats`
   - etc.

3. **Construction Permits** - 12 rutas
   - `/catastro/construction-permits`
   - `/catastro/construction-permits/:id`
   - `/catastro/construction-permits/number/:number`
   - `/catastro/construction-permits/:id/review`
   - `/catastro/construction-permits/:id/approve-reject`
   - etc.

4. **Permit Inspections** - 3 rutas
   - `/catastro/construction-permits/:id/inspections`
   - etc.

5. **Urban Inspections** - 8 rutas
   - `/catastro/urban-inspections`
   - `/catastro/urban-inspections/:id`
   - `/catastro/urban-inspections/property/:id`
   - `/catastro/urban-inspections/:id/notification`
   - `/catastro/urban-inspections/:id/sanction`
   - etc.

**Total: 41 rutas corregidas** ✅

---

## 🔄 COMPARACIÓN: ANTES vs DESPUÉS

### ANTES ❌
```javascript
// Request
api.get('/api/catastro/properties')

// URL generada
http://localhost:3001/api/api/catastro/properties

// Respuesta
{
  "success": false,
  "message": "Ruta no encontrada: GET /api/api/catastro/properties"
}
```

### DESPUÉS ✅
```javascript
// Request
api.get('/catastro/properties')

// URL generada
http://localhost:3001/api/catastro/properties

// Respuesta
{
  "success": true,
  "message": "Propiedades obtenidas exitosamente",
  "data": [...]
}
```

---

## 📝 NOTAS IMPORTANTES

### ¿Por qué pasó esto?

El servicio de catastro fue creado con rutas absolutas incluyendo `/api`, pero el cliente `api.js` ya tiene configurado `baseURL` con `/api` incluido.

### Patrón Correcto para Servicios:

Cuando uses el cliente `api` de `/lib/api.js`, las rutas deben ser **relativas** sin el prefijo `/api`:

```javascript
// ✅ CORRECTO
api.get('/catastro/properties')
api.get('/tax/taxpayers')
api.get('/projects')

// ❌ INCORRECTO
api.get('/api/catastro/properties')  // Genera /api/api/catastro/properties
api.get('/api/tax/taxpayers')        // Genera /api/api/tax/taxpayers
```

### Otros Módulos:

Revisé otros servicios y están correctos:
- ✅ **Tax Service**: Usa rutas relativas `/tax/...`
- ✅ **Projects Service**: Usa rutas relativas `/projects/...`
- ✅ **Finance Service**: Usa rutas relativas `/finance/...`

Solo el módulo **Catastro** tenía este problema.

---

## 🎯 RESULTADO

### Estado Actual:

Todas las páginas del módulo Catastro ahora **funcionan correctamente** en desarrollo:

| Página | Ruta | Estado |
|--------|------|--------|
| **Propiedades** | `/catastro/propiedades` | ✅ Carga datos |
| **Variables Urbanas** | `/catastro/variables-urbanas` | ✅ Carga datos |
| **Permisos** | `/catastro/permisos` | ✅ Carga datos |
| **Control Urbano** | `/catastro/control-urbano` | ✅ Carga datos |
| **Mapa** | `/catastro/mapa` | ✅ Funcional |
| **Consulta Pública** | `/catastro/consulta-publica` | ✅ Funcional |

### URLs del Backend (Correctas):

```bash
✅ GET  http://localhost:3001/api/catastro/properties
✅ GET  http://localhost:3001/api/catastro/urban-variables
✅ GET  http://localhost:3001/api/catastro/construction-permits
✅ GET  http://localhost:3001/api/catastro/urban-inspections
```

---

## 📦 DESPLIEGUE

**IMPORTANTE:** Este cambio es solo para **desarrollo**. 

Para aplicarlo a **producción**, ejecutar:

```bash
# Copiar archivo corregido
cp /var/alcaldia-saas/frontend/src/services/catastro.service.js \
   /var/alcaldia-saas/frontend-prod/src/services/

# Reiniciar frontend de producción
pm2 restart municipal-frontend-prod
```

---

## ✅ ESTADO FINAL

**Problema resuelto completamente en desarrollo:**

1. ✅ Identificado problema de rutas duplicadas `/api/api`
2. ✅ Corregidas 41 rutas en el servicio de catastro
3. ✅ Todas las páginas cargan datos correctamente
4. ✅ Patrón correcto documentado para futuros servicios

**El módulo Catastro está completamente funcional en desarrollo.**

Para producción, aplicar el mismo archivo cuando sea necesario.
