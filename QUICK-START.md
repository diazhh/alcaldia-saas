# 🚀 Quick Start - Sistema Municipal

## 🔧 Desarrollo (Puertos 3000-3001)

### Iniciar Backend
```bash
cd backend
npm run dev
```
**URL**: http://localhost:3001

### Iniciar Frontend
```bash
cd frontend
npm run dev
```
**URL**: http://localhost:3000

---

## 🌐 Producción (Puertos 3002-3003)

### Primera vez - Despliegue completo
```bash
# Instalar PM2 globalmente (solo una vez)
npm install -g pm2

# Desplegar
./scripts/deploy-production.sh
```

### Comandos rápidos
```bash
# Ver estado
./scripts/status.sh
pm2 status

# Ver logs
pm2 logs

# Reiniciar
./scripts/restart-production.sh

# Detener
./scripts/stop-production.sh
```

**URLs**:
- Frontend: http://147.93.184.19:3002
- Backend: http://147.93.184.19:3003

---

## 📊 Verificar estado

```bash
./scripts/status.sh
```

---

## 🔄 Actualizar código en producción

```bash
git pull origin main
./scripts/deploy-production.sh
```

---

## 📝 Documentación completa

Ver [README-DEPLOYMENT.md](./README-DEPLOYMENT.md) para guía detallada.
