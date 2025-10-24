# 📋 Resumen: Configuración de Entorno de Producción

## ✅ Lo que se ha configurado

### 1. **Separación de Entornos**

| Aspecto | Desarrollo | Producción |
|---------|-----------|------------|
| **Frontend** | Puerto 3000 | Puerto 3002 |
| **Backend** | Puerto 3001 | Puerto 3003 |
| **Base de Datos** | Puerto 5433 (dev) | Puerto 5432 (prod) |
| **Gestión** | `npm run dev` | PM2 |
| **Build** | Hot reload | Compilado optimizado |

### 2. **Archivos Creados**

#### Configuración
- ✅ `ecosystem.config.js` - Configuración PM2 con entornos separados
- ✅ `backend/.env.production` - Variables de entorno del backend en producción
- ✅ `frontend/.env.production` - Variables de entorno del frontend en producción
- ✅ `backend/.env.production.example` - Plantilla de configuración
- ✅ `frontend/.env.production.example` - Plantilla de configuración

#### Scripts de Gestión
- ✅ `scripts/deploy-production.sh` - Despliegue completo automático
- ✅ `scripts/restart-production.sh` - Reiniciar aplicaciones
- ✅ `scripts/stop-production.sh` - Detener aplicaciones
- ✅ `scripts/status.sh` - Ver estado de todos los servicios
- ✅ `scripts/setup-prod-db.sh` - Configurar base de datos de producción

#### Documentación
- ✅ `README-DEPLOYMENT.md` - Guía completa de despliegue
- ✅ `QUICK-START.md` - Inicio rápido
- ✅ `ARCHITECTURE.md` - Arquitectura del sistema
- ✅ `RESUMEN-PRODUCCION.md` - Este archivo

#### Otros
- ✅ `package.json` (raíz) - Scripts npm útiles
- ✅ `.gitignore` actualizado - Excluir archivos sensibles

---

## 🚀 Cómo Usar

### Primera Vez - Configuración Inicial

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Configurar variables de entorno
cp backend/.env.production.example backend/.env.production
cp frontend/.env.production.example frontend/.env.production

# Editar los archivos .env.production con tus valores reales
nano backend/.env.production
nano frontend/.env.production

# 3. Configurar base de datos de producción
./scripts/setup-prod-db.sh

# 4. Desplegar
./scripts/deploy-production.sh
```

### Uso Diario

```bash
# Ver estado
./scripts/status.sh

# Ver logs
pm2 logs

# Reiniciar
./scripts/restart-production.sh

# Detener
./scripts/stop-production.sh
```

### Actualizar Código

```bash
# Hacer pull de cambios
git pull origin main

# Re-desplegar
./scripts/deploy-production.sh
```

---

## 🔧 Solución para Backend en Producción

### Opción Recomendada: PM2 (Ya configurado)

**Ventajas:**
- ✅ Modo cluster (múltiples instancias)
- ✅ Load balancing automático
- ✅ Auto-restart en crashes
- ✅ Zero-downtime restarts
- ✅ Logs centralizados
- ✅ Monitoreo en tiempo real
- ✅ Fácil de usar

**Configuración:**
```javascript
// ecosystem.config.js
{
  name: 'municipal-backend-prod',
  script: 'src/server.js',
  instances: 'max',        // Usar todos los CPUs
  exec_mode: 'cluster',    // Modo cluster
  autorestart: true,       // Auto-reinicio
  max_memory_restart: '1G' // Reiniciar si usa >1GB
}
```

### Otras Opciones (No implementadas, pero disponibles)

#### 1. **Systemd Service**
Crear un servicio del sistema para auto-inicio:
```bash
sudo nano /etc/systemd/system/municipal-backend.service
```

#### 2. **Docker**
Containerizar la aplicación:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
CMD ["node", "src/server.js"]
```

#### 3. **Nginx como Reverse Proxy**
Usar Nginx delante de PM2 para SSL/HTTPS:
```nginx
server {
    listen 80;
    location / {
        proxy_pass http://localhost:3003;
    }
}
```

---

## 📊 Comparación: Desarrollo vs Producción

### Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# → http://localhost:3001

# Terminal 2 - Frontend  
cd frontend
npm run dev
# → http://localhost:3000
```

**Características:**
- Hot reload automático
- Source maps completos
- Logs detallados
- Sin optimizaciones
- Base de datos de desarrollo

### Producción
```bash
# Un solo comando
./scripts/deploy-production.sh
# → Frontend: http://147.93.184.19:3002
# → Backend: http://147.93.184.19:3003
```

**Características:**
- Código compilado y minificado
- Múltiples instancias (cluster)
- Logs optimizados
- Optimizaciones de performance
- Base de datos de producción separada
- Auto-restart en crashes
- Gestión centralizada con PM2

---

## 🔐 Seguridad en Producción

### Checklist Importante

- [ ] **Cambiar JWT_SECRET** en `.env.production`
  ```bash
  # Generar un secret seguro
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Configurar CORS** correctamente
  ```env
  CORS_ORIGIN=http://147.93.184.19:3002
  ```

- [ ] **Usar HTTPS** (configurar con Nginx + Let's Encrypt)

- [ ] **Configurar Firewall**
  ```bash
  sudo ufw allow 3002/tcp
  sudo ufw allow 3003/tcp
  ```

- [ ] **Backups de Base de Datos**
  ```bash
  pg_dump -h localhost -p 5432 -U municipal_user municipal_db_prod > backup.sql
  ```

- [ ] **Monitorear Logs** regularmente
  ```bash
  pm2 logs --err
  ```

---

## 📈 Ventajas de esta Configuración

### 1. **Aislamiento Total**
- Desarrollo y producción NO interfieren
- Puertos diferentes
- Bases de datos diferentes
- Código separado (dev con hot reload, prod compilado)

### 2. **Fácil de Gestionar**
- Scripts automatizados
- Un comando para desplegar
- PM2 gestiona todo automáticamente

### 3. **Escalable**
- Backend en modo cluster (múltiples CPUs)
- Fácil agregar más instancias
- Load balancing automático

### 4. **Confiable**
- Auto-restart en crashes
- Logs persistentes
- Monitoreo en tiempo real

### 5. **Profesional**
- Configuración estándar de la industria
- Fácil de mantener
- Documentación completa

---

## 🆘 Comandos de Emergencia

```bash
# Si algo falla, detener todo
pm2 delete all

# Ver qué está usando los puertos
lsof -i :3002
lsof -i :3003

# Matar proceso específico
kill -9 <PID>

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Ver logs de errores
pm2 logs --err --lines 100

# Verificar estado de la base de datos
psql -h localhost -p 5432 -U municipal_user -d municipal_db_prod
```

---

## 📞 Próximos Pasos Recomendados

1. **Configurar HTTPS con Nginx**
   - Instalar Nginx
   - Configurar reverse proxy
   - Obtener certificado SSL con Let's Encrypt

2. **Configurar Backups Automáticos**
   - Crear script de backup de BD
   - Configurar cron job diario

3. **Monitoreo Avanzado**
   - PM2 Plus (monitoreo en la nube)
   - Configurar alertas

4. **CI/CD**
   - GitHub Actions
   - Deploy automático en push

---

## 📚 Recursos Adicionales

- **PM2 Docs**: https://pm2.keymetrics.io/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Production**: https://www.prisma.io/docs/guides/deployment
- **PostgreSQL Backup**: https://www.postgresql.org/docs/current/backup.html

---

## ✅ Resumen Final

**Has configurado exitosamente:**
- ✅ Entornos separados (dev: 3000-3001, prod: 3002-3003)
- ✅ PM2 para gestión del backend en producción
- ✅ Scripts automatizados de despliegue
- ✅ Configuración de variables de entorno
- ✅ Documentación completa
- ✅ Base de datos de producción separada

**Para empezar:**
```bash
./scripts/deploy-production.sh
```

**Para verificar:**
```bash
./scripts/status.sh
```

¡Tu aplicación está lista para producción! 🎉
