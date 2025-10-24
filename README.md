# 🏛️ Sistema Integral de Gestión Municipal

Sistema completo de gestión para alcaldías venezolanas, desarrollado con tecnologías modernas y arquitectura escalable.

## 🚀 Deploy Rápido

```bash
# Desplegar cambios a producción (puertos 3002-3003)
./deploy.sh
```

**URLs:**
- **Frontend Producción**: http://147.93.184.19:3002
- **Backend Producción**: http://147.93.184.19:3003
- **Frontend Desarrollo**: http://localhost:3000
- **Backend Desarrollo**: http://localhost:3001

## 📋 Descripción

Sistema web integral que permite a las alcaldías gestionar de manera eficiente todos los aspectos de la administración municipal, incluyendo:

- 🔐 **Autenticación y Control de Acceso** (RBAC)
- 🏢 **Estructura Organizacional**
- 📊 **Gestión de Proyectos**
- 💰 **Finanzas Municipales**
- 👥 **Recursos Humanos**
- 🏘️ **Sistema Tributario**
- 🗺️ **Catastro Municipal**
- 🤝 **Participación Ciudadana**
- 🚗 **Gestión de Flota**
- 📦 **Inventario de Bienes**
- 📄 **Gestión Documental**
- 🔧 **Servicios Públicos**
- 📈 **Dashboards Ejecutivos**

## 🚀 Stack Tecnológico

### Backend
- **Node.js 18+** con **Express.js**
- **Prisma ORM** para PostgreSQL
- **JWT** para autenticación
- **Zod** para validación de schemas
- **Jest** + **Supertest** para testing

### Frontend
- **Next.js 14+** (App Router)
- **React 18+**
- **TailwindCSS** para estilos
- **shadcn/ui** para componentes UI
- **Zustand** para estado global
- **React Query** para data fetching
- **Jest** + **React Testing Library** para testing

### Base de Datos
- **PostgreSQL 14+**
- Migraciones con **Prisma Migrate**

### DevOps
- **Docker** + **Docker Compose**
- **Git** con conventional commits

## 📁 Estructura del Proyecto

```
municipal-system/
├── backend/              # API REST con Express
│   ├── src/
│   │   ├── config/      # Configuraciones (DB, JWT, etc.)
│   │   ├── modules/     # Módulos de negocio
│   │   ├── shared/      # Middlewares, utils, constantes
│   │   ├── prisma/      # Schema y migraciones
│   │   └── server.js    # Entry point
│   └── tests/           # Tests unitarios e integración
│
├── frontend/            # Aplicación Next.js
│   ├── src/
│   │   ├── app/        # App Router de Next.js
│   │   ├── components/ # Componentes React
│   │   ├── lib/        # Configuraciones (Axios, React Query)
│   │   ├── hooks/      # Custom hooks
│   │   └── store/      # Zustand stores
│   └── tests/          # Tests de componentes
│
├── tasks/              # Definición de tareas del proyecto
├── docker-compose.yml  # Orquestación de servicios
└── README.md          # Este archivo
```

## 🛠️ Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **Docker** y **Docker Compose**
- **PostgreSQL** 14+ (o usar Docker)
- **Git**

## 🚦 Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd municipal-system
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Editar frontend/.env.local con la URL del backend
```

### 3. Levantar con Docker (Recomendado)

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto `5432`
- Backend en puerto `3001`
- Frontend en puerto `3000`

### 4. Ejecutar migraciones de base de datos

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### 5. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentación API**: http://localhost:3001/api-docs (próximamente)

## 💻 Desarrollo Local (Sin Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Backend

```bash
cd backend
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Con coverage
```

### Frontend

```bash
cd frontend
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Con coverage
```

## 📝 Scripts Disponibles

### Backend
- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm start` - Inicia el servidor en producción
- `npm test` - Ejecuta los tests
- `npm run prisma:migrate` - Ejecuta migraciones de BD
- `npm run prisma:seed` - Puebla la BD con datos iniciales
- `npm run prisma:studio` - Abre Prisma Studio

### Frontend
- `npm run dev` - Inicia Next.js en desarrollo
- `npm run build` - Construye para producción
- `npm start` - Inicia en modo producción
- `npm test` - Ejecuta los tests
- `npm run lint` - Ejecuta ESLint

## 🔒 Seguridad

- Autenticación basada en **JWT**
- Control de acceso basado en roles (**RBAC**)
- Validación de datos con **Zod**
- Protección contra CSRF, XSS, SQL Injection
- Headers de seguridad con **Helmet**
- Rate limiting en endpoints críticos

## 📚 Documentación

- [PRD Completo](./prd.txt) - Especificaciones detalladas del proyecto
- [Tareas del Proyecto](./tasks/) - Desglose de fases y subtareas
- [Guía de Desarrollo](./.windsurf/rules/new.md) - Reglas y metodología

## 🤝 Contribución

Este proyecto sigue un flujo de desarrollo estructurado por fases:

1. Revisar las tareas en `/tasks/`
2. Seguir el orden secuencial de las fases
3. Escribir tests para nuevas funcionalidades
4. Hacer commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
5. Asegurar que el código pase ESLint y Prettier

## 📄 Licencia

[Especificar licencia]

## 👥 Equipo

[Información del equipo de desarrollo]

---

**Estado del Proyecto**: 🚧 En Desarrollo - Fase 0 (Core)

**Última actualización**: Octubre 2025
