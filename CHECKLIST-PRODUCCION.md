# ✅ Checklist de Despliegue a Producción

## 📋 Pre-Despliegue

### Requisitos del Sistema
- [ ] Node.js v18+ instalado
- [ ] npm instalado
- [ ] PostgreSQL instalado y corriendo
- [ ] PM2 instalado globalmente (`npm install -g pm2`)
- [ ] Git configurado

### Configuración de Base de Datos
- [ ] PostgreSQL corriendo en puerto 5432
- [ ] Usuario `municipal_user` creado
- [ ] Base de datos `municipal_db_prod` creada
- [ ] Permisos configurados correctamente

### Variables de Entorno
- [ ] Archivo `backend/.env.production` creado
- [ ] `JWT_SECRET` cambiado a valor seguro (32+ caracteres)
- [ ] `DATABASE_URL` configurada correctamente
- [ ] `CORS_ORIGIN` configurado con URL correcta
- [ ] Archivo `frontend/.env.production` creado
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend de producción

### Código
- [ ] Último código del repositorio (`git pull`)
- [ ] Sin errores de compilación
- [ ] Tests pasando (si existen)
- [ ] Dependencias actualizadas

---

## 🚀 Despliegue

### Ejecución
- [ ] Scripts tienen permisos de ejecución (`chmod +x scripts/*.sh`)
- [ ] Base de datos configurada (`./scripts/setup-prod-db.sh`)
- [ ] Despliegue ejecutado (`./scripts/deploy-production.sh`)
- [ ] Sin errores durante el despliegue

### Verificación Post-Despliegue
- [ ] PM2 muestra aplicaciones corriendo (`pm2 status`)
- [ ] Backend responde (`curl http://localhost:3003/health`)
- [ ] Frontend accesible (http://147.93.184.19:3002)
- [ ] Backend accesible (http://147.93.184.19:3003)
- [ ] Login funciona correctamente
- [ ] Dashboard carga datos

---

## 🔐 Seguridad

### Configuración Básica
- [ ] JWT_SECRET único y seguro
- [ ] CORS configurado solo para dominios permitidos
- [ ] Rate limiting activado
- [ ] Helmet configurado (headers de seguridad)

### Firewall
- [ ] Puerto 3002 permitido (frontend)
- [ ] Puerto 3003 permitido (backend)
- [ ] Puerto 5432 protegido (solo localhost)
- [ ] Firewall activado (`sudo ufw status`)

### HTTPS (Recomendado)
- [ ] Nginx instalado (opcional)
- [ ] Certificado SSL configurado (opcional)
- [ ] Redirección HTTP → HTTPS (opcional)

---

## 📊 Monitoreo

### PM2
- [ ] PM2 guardado (`pm2 save`)
- [ ] PM2 startup configurado (`pm2 startup`)
- [ ] Logs accesibles (`pm2 logs`)
- [ ] Monitoreo funciona (`pm2 monit`)

### Logs
- [ ] Directorio `logs/` creado
- [ ] Logs de backend escribiendo
- [ ] Logs de frontend escribiendo
- [ ] Rotación de logs configurada (opcional)

### Alertas
- [ ] Monitoreo de memoria configurado (max_memory_restart)
- [ ] Auto-restart activado
- [ ] Notificaciones configuradas (opcional)

---

## 🔄 Backups

### Base de Datos
- [ ] Script de backup creado
- [ ] Backup manual realizado
- [ ] Cron job configurado (opcional)
- [ ] Backups almacenados en ubicación segura

### Código
- [ ] Repositorio Git actualizado
- [ ] Tags de versión creados
- [ ] Documentación actualizada

---

## 🧪 Testing en Producción

### Funcionalidad Básica
- [ ] Página de login carga
- [ ] Login con credenciales válidas funciona
- [ ] Dashboard principal muestra datos
- [ ] Navegación entre módulos funciona
- [ ] API responde correctamente

### Performance
- [ ] Tiempo de carga < 3 segundos
- [ ] API responde < 500ms
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs de PM2

### Módulos Críticos
- [ ] Módulo de Proyectos funciona
- [ ] Módulo de Finanzas funciona
- [ ] Módulo de RRHH funciona
- [ ] Módulo Tributario funciona
- [ ] Otros módulos funcionan

---

## 📱 Accesibilidad

### URLs
- [ ] Frontend: http://147.93.184.19:3002
- [ ] Backend: http://147.93.184.19:3003
- [ ] Health check: http://147.93.184.19:3003/health

### Desde Diferentes Dispositivos
- [ ] Accesible desde navegador desktop
- [ ] Accesible desde navegador móvil
- [ ] Accesible desde red local
- [ ] Accesible desde internet (si aplica)

---

## 📚 Documentación

### Archivos Creados
- [ ] README-DEPLOYMENT.md existe
- [ ] QUICK-START.md existe
- [ ] ARCHITECTURE.md existe
- [ ] RESUMEN-PRODUCCION.md existe
- [ ] Este checklist existe

### Información Documentada
- [ ] URLs de producción documentadas
- [ ] Credenciales almacenadas de forma segura
- [ ] Procedimientos de emergencia documentados
- [ ] Contactos de soporte documentados

---

## 🎯 Post-Despliegue

### Comunicación
- [ ] Equipo notificado del despliegue
- [ ] Usuarios informados (si aplica)
- [ ] Ventana de mantenimiento comunicada (si aplica)

### Monitoreo Inicial
- [ ] Monitorear logs por 30 minutos
- [ ] Verificar uso de recursos (CPU, RAM)
- [ ] Verificar conexiones a base de datos
- [ ] Verificar errores en logs

### Rollback Plan
- [ ] Backup de BD anterior disponible
- [ ] Versión anterior del código disponible
- [ ] Procedimiento de rollback documentado
- [ ] Tiempo estimado de rollback conocido

---

## 🔧 Mantenimiento Continuo

### Diario
- [ ] Revisar logs de errores
- [ ] Verificar estado de PM2
- [ ] Verificar uso de disco

### Semanal
- [ ] Backup de base de datos
- [ ] Revisar performance
- [ ] Actualizar dependencias (si hay parches de seguridad)

### Mensual
- [ ] Revisar y limpiar logs antiguos
- [ ] Actualizar documentación
- [ ] Revisar métricas de uso
- [ ] Planear optimizaciones

---

## 🆘 Plan de Emergencia

### Contactos
- [ ] Contacto técnico principal: __________________
- [ ] Contacto técnico backup: __________________
- [ ] Contacto de infraestructura: __________________

### Procedimientos
- [ ] Cómo detener aplicaciones: `./scripts/stop-production.sh`
- [ ] Cómo reiniciar aplicaciones: `./scripts/restart-production.sh`
- [ ] Cómo ver logs: `pm2 logs --err`
- [ ] Cómo hacer rollback: Documentado en README-DEPLOYMENT.md

### Comandos de Emergencia
```bash
# Detener todo
pm2 delete all

# Ver procesos en puertos
lsof -i :3002
lsof -i :3003

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Ver logs de errores
pm2 logs --err --lines 100
```

---

## ✅ Firma de Aprobación

- [ ] Checklist completado
- [ ] Aplicación funcionando en producción
- [ ] Equipo capacitado en procedimientos
- [ ] Documentación entregada

**Fecha de despliegue:** _________________

**Responsable:** _________________

**Firma:** _________________

---

## 📝 Notas Adicionales

_Espacio para notas específicas del despliegue:_

```
[Escribe aquí cualquier nota importante sobre este despliegue]
```

---

**¡Felicidades! Tu aplicación está en producción 🎉**
