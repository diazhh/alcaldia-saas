# 🚀 Guía de Despliegue - Sistema Municipal

## 📋 Tabla de Contenidos
- [Entornos](#entornos)
- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
- [Despliegue a Producción](#despliegue-a-producción)
- [Gestión de Aplicaciones](#gestión-de-aplicaciones)
- [Troubleshooting](#troubleshooting)

---

## 🌍 Entornos

### Desarrollo
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Base de Datos**: Puerto 5433
- **Comando**: `npm run dev` (en cada carpeta)

### Producción
- **Frontend**: http://147.93.184.19:3002
- **Backend**: http://147.93.184.19:3003
- **Base de Datos**: Puerto 5432
- **Gestión**: PM2

---

## ✅ Requisitos Previos

### 1. Node.js y npm
```bash
node --version  # v18+ recomendado
npm --version
```

### 2. PM2 (Gestor de procesos)
```bash
npm install -g pm2
```

### 3. PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Crear usuario y base de datos de producción
sudo -u postgres psql
CREATE USER municipal_user WITH PASSWORD 'municipal_password';
CREATE DATABASE municipal_db_prod OWNER municipal_user;
GRANT ALL PRIVILEGES ON DATABASE municipal_db_prod TO municipal_user;
\q
```

---

## ⚙️ Configuración Inicial

### 1. Variables de Entorno

#### Backend - Desarrollo (`.env`)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://municipal_user:municipal_password@localhost:5433/municipal_db"
JWT_SECRET=dev-secret-key-minimum-32-characters-long
CORS_ORIGIN=http://localhost:3000
```

#### Backend - Producción (`.env.production`)
```env
NODE_ENV=production
PORT=3003
DATABASE_URL="postgresql://municipal_user:municipal_password@localhost:5432/municipal_db_prod"
JWT_SECRET=CAMBIAR-ESTE-SECRET-EN-PRODUCCION-MIN-32-CHARS
CORS_ORIGIN=http://147.93.184.19:3002
```

#### Frontend - Desarrollo (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### Frontend - Producción (`.env.production`)
```env
NEXT_PUBLIC_API_URL=http://147.93.184.19:3003/api
```

### 2. Configurar Firewall (si es necesario)
```bash
# Permitir puertos de producción
sudo ufw allow 3002/tcp  # Frontend
sudo ufw allow 3003/tcp  # Backend
sudo ufw reload
```

---

## 🚀 Despliegue a Producción

### Opción 1: Script Automático (Recomendado)

```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh

# Ejecutar despliegue
./scripts/deploy-production.sh
```

Este script automáticamente:
- ✅ Verifica dependencias
- ✅ Crea base de datos de producción
- ✅ Instala dependencias del backend
- ✅ Ejecuta migraciones de Prisma
- ✅ Compila el frontend (Next.js build)
- ✅ Inicia aplicaciones con PM2
- ✅ Configura PM2 para auto-inicio

### Opción 2: Manual

#### Paso 1: Backend
```bash
cd backend

# Instalar dependencias de producción
npm ci --only=production

# Ejecutar migraciones
export DATABASE_URL="postgresql://municipal_user:municipal_password@localhost:5432/municipal_db_prod"
npx prisma migrate deploy
npx prisma generate
```

#### Paso 2: Frontend
```bash
cd frontend

# Instalar dependencias
npm ci

# Build de producción
npm run build
```

#### Paso 3: Iniciar con PM2
```bash
cd ..

# Iniciar aplicaciones
pm2 start ecosystem.config.js --env production

# Guardar configuración
pm2 save

# Auto-inicio en reinicio del servidor
pm2 startup
```

---

## 🎮 Gestión de Aplicaciones

### Comandos PM2 Básicos

```bash
# Ver estado de todas las aplicaciones
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs de una aplicación específica
pm2 logs municipal-backend-prod
pm2 logs municipal-frontend-prod

# Reiniciar aplicaciones
pm2 restart all
pm2 restart municipal-backend-prod
pm2 restart municipal-frontend-prod

# Detener aplicaciones
pm2 stop all
pm2 stop municipal-backend-prod

# Eliminar aplicaciones
pm2 delete all
pm2 delete municipal-backend-prod
```

### Scripts de Gestión

```bash
# Reiniciar producción
./scripts/restart-production.sh

# Detener producción
./scripts/stop-production.sh

# Re-desplegar (actualizar código)
./scripts/deploy-production.sh
```

### Monitoreo

```bash
# Dashboard de PM2
pm2 monit

# Información detallada
pm2 show municipal-backend-prod

# Logs guardados
ls -la logs/
tail -f logs/backend-out.log
tail -f logs/backend-error.log
```

---

## 🔧 Troubleshooting

### Problema: Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :3002
lsof -i :3003

# Matar proceso específico
kill -9 <PID>

# O detener con PM2
pm2 delete all
```

### Problema: Error de base de datos

```bash
# Verificar conexión
psql -h localhost -p 5432 -U municipal_user -d municipal_db_prod

# Re-ejecutar migraciones
cd backend
export DATABASE_URL="postgresql://municipal_user:municipal_password@localhost:5432/municipal_db_prod"
npx prisma migrate reset --force
npx prisma migrate deploy
```

### Problema: Frontend no conecta con Backend

1. Verificar que el backend esté corriendo:
```bash
curl http://localhost:3003/health
```

2. Verificar variables de entorno:
```bash
pm2 show municipal-frontend-prod | grep NEXT_PUBLIC_API_URL
```

3. Reconstruir frontend:
```bash
cd frontend
npm run build
pm2 restart municipal-frontend-prod
```

### Problema: Permisos de archivos

```bash
# Dar permisos a directorio de uploads
chmod -R 755 backend/public/uploads
chown -R $USER:$USER backend/public/uploads

# Dar permisos a logs
chmod -R 755 logs
```

### Ver logs de errores

```bash
# Backend
pm2 logs municipal-backend-prod --err --lines 100

# Frontend
pm2 logs municipal-frontend-prod --err --lines 100

# Todos los errores
pm2 logs --err
```

---

## 🔄 Actualizar Aplicación en Producción

```bash
# 1. Hacer pull de los cambios
git pull origin main

# 2. Re-desplegar
./scripts/deploy-production.sh

# O manualmente:
cd backend && npm ci && npx prisma migrate deploy
cd ../frontend && npm ci && npm run build
pm2 restart all
```

---

## 📊 Monitoreo de Recursos

```bash
# Uso de memoria y CPU
pm2 monit

# Información del sistema
pm2 info municipal-backend-prod

# Reiniciar si usa mucha memoria (ya configurado en ecosystem.config.js)
# max_memory_restart: '1G'
```

---

## 🔐 Seguridad en Producción

### Checklist:
- [ ] Cambiar `JWT_SECRET` en `.env.production`
- [ ] Configurar HTTPS/SSL (nginx/certbot)
- [ ] Configurar firewall (ufw)
- [ ] Limitar CORS a dominios específicos
- [ ] Configurar rate limiting
- [ ] Backups automáticos de base de datos
- [ ] Logs de auditoría activados

### Configurar HTTPS con Nginx (Opcional)

```nginx
# /etc/nginx/sites-available/municipal

server {
    listen 80;
    server_name 147.93.184.19;

    # Frontend
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs: `pm2 logs`
2. Verificar estado: `pm2 status`
3. Consultar documentación de PM2: https://pm2.keymetrics.io/

---

## 📝 Notas Importantes

- **Desarrollo** y **Producción** corren en puertos diferentes y NO interfieren entre sí
- PM2 gestiona automáticamente el reinicio en caso de crashes
- Los logs se guardan en `./logs/`
- PM2 puede configurarse para iniciar automáticamente al arrancar el servidor
- Siempre hacer backup de la base de datos antes de migraciones en producción
