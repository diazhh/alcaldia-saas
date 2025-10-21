# 🐳 Guía de Docker para el Sistema Municipal

Esta guía explica cómo usar Docker para desarrollar y desplegar el Sistema Integral de Gestión Municipal.

## 📋 Requisitos Previos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- Al menos 4GB de RAM disponible
- Puertos disponibles: 3000 (frontend), 3001 (backend), 5432 (PostgreSQL)

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores (opcional, los valores por defecto funcionan)
nano .env
```

### 2. Levantar el Entorno de Desarrollo

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 3. Verificar que Todo Funciona

```bash
# Verificar el estado de los contenedores
docker-compose ps

# Deberías ver 3 servicios corriendo:
# - municipal-postgres (puerto 5432)
# - municipal-backend (puerto 3001)
# - municipal-frontend (puerto 3000)
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Base de Datos**: localhost:5432

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina la BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de las últimas 100 líneas
docker-compose logs --tail=100
```

### Reconstruir Contenedores

```bash
# Reconstruir todos los servicios
docker-compose build

# Reconstruir un servicio específico
docker-compose build backend

# Reconstruir sin usar caché
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Ejecutar Comandos Dentro de los Contenedores

```bash
# Acceder al shell del backend
docker-compose exec backend sh

# Acceder al shell del frontend
docker-compose exec frontend sh

# Acceder a PostgreSQL
docker-compose exec postgres psql -U municipal_user -d municipal_db

# Ejecutar migraciones de Prisma
docker-compose exec backend npx prisma migrate dev

# Ejecutar seeds
docker-compose exec backend npx prisma db seed

# Ver el estado de la base de datos con Prisma Studio
docker-compose exec backend npx prisma studio
```

### Gestión de la Base de Datos

```bash
# Crear una nueva migración
docker-compose exec backend npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones pendientes
docker-compose exec backend npx prisma migrate deploy

# Resetear la base de datos (¡CUIDADO! Elimina todos los datos)
docker-compose exec backend npx prisma migrate reset

# Generar Prisma Client
docker-compose exec backend npx prisma generate

# Backup de la base de datos
docker-compose exec postgres pg_dump -U municipal_user municipal_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U municipal_user -d municipal_db < backup.sql
```

### Testing

```bash
# Ejecutar tests del backend
docker-compose exec backend npm test

# Ejecutar tests del frontend
docker-compose exec frontend npm test

# Ejecutar tests con coverage
docker-compose exec backend npm run test:coverage
docker-compose exec frontend npm run test:coverage
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker-compose rm

# Limpiar imágenes no usadas
docker image prune

# Limpiar todo (contenedores, redes, volúmenes, imágenes)
docker system prune -a --volumes
```

## 🏭 Producción

### Desplegar en Producción

```bash
# Usar el archivo de producción
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener
docker-compose -f docker-compose.prod.yml down
```

### Variables de Entorno para Producción

Asegúrate de configurar estas variables en producción:

```bash
# Seguridad
JWT_SECRET=<genera-una-clave-segura-de-al-menos-32-caracteres>

# Base de datos
POSTGRES_PASSWORD=<contraseña-segura>
DATABASE_URL=postgresql://usuario:password@host:5432/database

# URLs
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

## 🔍 Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar el estado
docker-compose ps

# Reconstruir sin caché
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Error de conexión a la base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar la conexión
docker-compose exec backend npx prisma db push
```

### Puerto ya en uso

```bash
# Cambiar los puertos en .env
FRONTEND_PORT=3001
BACKEND_PORT=3002
POSTGRES_PORT=5433

# Reiniciar
docker-compose down
docker-compose up -d
```

### Problemas con volúmenes

```bash
# Eliminar volúmenes y empezar de cero
docker-compose down -v
docker-compose up -d

# Listar volúmenes
docker volume ls

# Eliminar un volumen específico
docker volume rm municipal-system_postgres_data
```

### Hot reload no funciona

```bash
# Verificar que los volúmenes están montados correctamente
docker-compose config

# Reiniciar el servicio
docker-compose restart frontend
```

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Ver estadísticas en tiempo real
docker stats

# Ver solo servicios del proyecto
docker stats municipal-backend municipal-frontend municipal-postgres
```

### Healthchecks

```bash
# Ver el estado de salud de los contenedores
docker-compose ps

# Inspeccionar el healthcheck
docker inspect --format='{{json .State.Health}}' municipal-backend
```

## 🔐 Seguridad

### Mejores Prácticas

1. **Nunca** commitear el archivo `.env` con credenciales reales
2. Usar **secrets** de Docker para información sensible en producción
3. Mantener las imágenes actualizadas: `docker-compose pull`
4. Usar usuarios no-root en los contenedores (ya configurado en Dockerfile)
5. Limitar recursos con `deploy.resources` en docker-compose

### Escanear Vulnerabilidades

```bash
# Escanear imágenes con Docker Scout (si está disponible)
docker scout cves municipal-backend
docker scout cves municipal-frontend
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Best Practices de Dockerfile](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Prisma con Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

**Última actualización**: Octubre 2025
