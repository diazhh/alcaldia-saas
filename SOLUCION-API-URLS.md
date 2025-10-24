# Solución al Problema de URLs de API

## 🔍 Problema Identificado

El frontend tenía **dos patrones diferentes** para construir URLs de API:

### Patrón 1: Hooks Modernos (Correcto)
```javascript
// hooks/useProjects.js
import api from '@/lib/api';
const response = await api.get(`/projects`);
```
- Usa el cliente `api` de `lib/api.js`
- El cliente tiene `baseURL: API_URL`
- Las rutas son relativas: `/projects`, `/tax/taxpayers`

### Patrón 2: Componentes Legacy (Inconsistente)
```javascript
// components/modules/tax/TaxpayerTable.jsx
const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tax/taxpayers`);
```
- Usa axios directamente
- Construye la URL completa manualmente
- Agrega `/api` manualmente

## ❌ Errores Encontrados

1. **`.env.production.local`**: Tenía puerto 3001 (desarrollo) en lugar de 3003 (producción)
2. **`deploy.sh`**: Compilaba con `NEXT_PUBLIC_API_URL=http://...3003/api` (con `/api` al final)
3. **`constants/index.js`**: `API_URL` no agregaba `/api` consistentemente
4. **Componentes tax**: Usaban `process.env.NEXT_PUBLIC_API_URL` directamente

## ✅ Solución Implementada

### 1. Variables de Entorno Corregidas

**`.env.local` (desarrollo)**:
```bash
NEXT_PUBLIC_API_URL=http://147.93.184.19:3001
```

**`.env.production` y `.env.production.local` (producción)**:
```bash
NEXT_PUBLIC_API_URL=http://147.93.184.19:3003
```

**`deploy.sh`**:
```bash
export NEXT_PUBLIC_API_URL=http://147.93.184.19:3003  # SIN /api
```

### 2. Constants Actualizadas

**`src/constants/index.js`**:
```javascript
// URL base sin /api (para componentes legacy)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// URL completa con /api (para el cliente api.js)
export const API_URL = `${API_BASE_URL}/api`;
```

### 3. Componentes Tax Actualizados

Todos los componentes del módulo tributario ahora usan:
```javascript
import { API_BASE_URL } from '@/constants';
const response = await axios.get(`${API_BASE_URL}/api/tax/taxpayers`);
```

## 📋 Estructura Final

### Backend (Express)
```
http://147.93.184.19:3001 (desarrollo)
http://147.93.184.19:3003 (producción)
  └── /api
      ├── /auth
      ├── /projects
      ├── /tax
      └── ...
```

### Frontend (Next.js)

**Hooks modernos**:
```javascript
import api from '@/lib/api';
// api tiene baseURL = API_URL = "http://...3001/api"
await api.get('/projects');  // → http://...3001/api/projects ✅
```

**Componentes legacy**:
```javascript
import { API_BASE_URL } from '@/constants';
// API_BASE_URL = "http://...3001"
await axios.get(`${API_BASE_URL}/api/tax/taxpayers`);  // → http://...3001/api/tax/taxpayers ✅
```

## 🎯 Resultado

✅ Desarrollo (3001) y Producción (3003) funcionan correctamente
✅ Todas las llamadas a la API incluyen `/api` en la ruta
✅ No hay duplicación de `/api` en las URLs
✅ Ambos patrones (hooks y componentes legacy) funcionan

## 📝 Recomendación Futura

Migrar gradualmente todos los componentes legacy para usar el cliente `api` de `lib/api.js` en lugar de axios directo. Esto centralizaría:
- Manejo de tokens
- Interceptores de error
- Configuración de timeouts
- Construcción de URLs
