# Arquitectura de Desarrollo y Producción

## 🏗️ Estructura de Carpetas

```
/var/alcaldia-saas/
├── backend/              # Backend de DESARROLLO
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── node_modules/
│
├── backend-prod/         # Backend de PRODUCCIÓN (generado por deploy.sh)
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── node_modules/
│
├── frontend/             # Frontend de DESARROLLO
│   ├── src/
│   ├── public/
│   ├── .next/           # Build de desarrollo
│   ├── package.json
│   └── node_modules/
│
├── frontend-prod/        # Frontend de PRODUCCIÓN (generado por deploy.sh)
│   ├── src/
│   ├── public/
│   ├── .next/           # Build de producción
│   ├── package.json
│   └── node_modules/
│
├── deploy.sh             # Script de deploy a producción
└── ecosystem.config.js   # Configuración de PM2
```

## 🔄 Flujo de Trabajo

### Desarrollo (Puertos 3000-3001)

**Backend (puerto 3001)**:
```bash
cd /var/alcaldia-saas/backend
npm run dev  # Usa nodemon para hot-reload
```

**Frontend (puerto 3000)**:
```bash
cd /var/alcaldia-saas/frontend
npm run dev  # Usa next dev para hot-reload
```

### Producción (Puertos 3002-3003)

**Deploy completo**:
```bash
cd /var/alcaldia-saas
./deploy.sh
```

El script `deploy.sh` hace:

1. **Backend**:
   - Limpia `backend-prod/`
   - Copia todo de `backend/` → `backend-prod/`
   - Instala dependencias de producción
   - Genera Prisma client
   - Levanta con PM2 en puerto 3003

2. **Frontend**:
   - Limpia `frontend-prod/`
   - Copia todo de `frontend/` → `frontend-prod/`
   - Instala dependencias
   - Compila con `next build`
   - Levanta con PM2 en puerto 3002

## 🎯 Ventajas de Esta Arquitectura

### ✅ Separación Completa
- Cada entorno tiene su propia carpeta
- No hay conflictos entre `.next` de dev y prod
- No hay conflictos entre `node_modules`
- No hay conflictos de puertos

### ✅ Desarrollo Ágil
- Hot-reload en desarrollo con nodemon y next dev
- Cambios instantáneos sin recompilar
- No afecta a producción

### ✅ Producción Estable
- Build optimizado y compilado
- PM2 gestiona procesos y reinicia automáticamente
- Logs separados por entorno
- No se ve afectado por cambios en desarrollo

### ✅ Ambos Entornos Simultáneos
- Puedes tener desarrollo y producción corriendo al mismo tiempo
- Prueba cambios en desarrollo mientras producción está activo
- Compara comportamiento entre entornos

## 📊 Configuración de URLs

### Backend

**Desarrollo** (`./backend`):
- Puerto: 3001
- Base URL: `http://147.93.184.19:3001`
- Rutas API: `/api/auth`, `/api/projects`, `/api/tax`, etc.

**Producción** (`./backend-prod`):
- Puerto: 3003
- Base URL: `http://147.93.184.19:3003`
- Rutas API: `/api/auth`, `/api/projects`, `/api/tax`, etc.

### Frontend

**Desarrollo** (`./frontend`):
- Puerto: 3000
- URL: `http://147.93.184.19:3000`
- API URL: `http://147.93.184.19:3001` (sin `/api`)
- Archivo: `.env.local`

**Producción** (`./frontend-prod`):
- Puerto: 3002
- URL: `http://147.93.184.19:3002`
- API URL: `http://147.93.184.19:3003` (sin `/api`)
- Configurado por: `deploy.sh` al compilar

## 🛠️ Comandos Útiles

### PM2 (Producción)

```bash
# Ver estado de servicios
pm2 ls

# Ver logs en tiempo real
pm2 logs

# Ver logs de un servicio específico
pm2 logs municipal-backend-prod
pm2 logs municipal-frontend-prod

# Reiniciar servicios
pm2 restart municipal-backend-prod
pm2 restart municipal-frontend-prod

# Detener servicios
pm2 stop municipal-backend-prod
pm2 stop municipal-frontend-prod

# Ver información detallada
pm2 info municipal-backend-prod
```

### Deploy

```bash
# Deploy completo (backend + frontend)
./deploy.sh

# Solo backend (manual)
cd backend-prod
npm ci --only=production
npx prisma generate
pm2 restart municipal-backend-prod

# Solo frontend (manual)
cd frontend-prod
npm ci
npm run build
pm2 restart municipal-frontend-prod
```

## ⚠️ Reglas Importantes

1. **NUNCA edites archivos en `backend-prod/` o `frontend-prod/`**
   - Estas carpetas se sobrescriben en cada deploy
   - Todos los cambios se pierden

2. **Siempre trabaja en `backend/` y `frontend/`**
   - Estas son las carpetas de desarrollo
   - Los cambios aquí se copian a producción con `deploy.sh`

3. **Usa `deploy.sh` para actualizar producción**
   - No copies archivos manualmente
   - El script asegura que todo se copie correctamente

4. **Las carpetas `*-prod/` están en `.gitignore`**
   - No se suben al repositorio
   - Se generan en cada servidor según sea necesario

## 🔐 Variables de Entorno

### Desarrollo

**Backend** (`backend/.env`):
```env
PORT=3001
DATABASE_URL=postgresql://...@localhost:5433/municipal_db
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://147.93.184.19:3001
```

### Producción

**Backend** (`backend-prod/.env` - copiado de backend):
- Usa las mismas variables pero con configuración de producción en PM2

**Frontend** (`frontend-prod`):
- La URL se configura en tiempo de compilación por `deploy.sh`
- `NEXT_PUBLIC_API_URL=http://147.93.184.19:3003`

## 📝 Notas Adicionales

- El frontend usa dos constantes para URLs:
  - `API_BASE_URL`: URL base sin `/api` (para componentes legacy)
  - `API_URL`: URL completa con `/api` (para hooks modernos)

- Ambas se construyen automáticamente desde `NEXT_PUBLIC_API_URL`

- El backend siempre usa el prefijo `/api` en todas sus rutas
