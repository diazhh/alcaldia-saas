# 🏗️ Arquitectura del Sistema Municipal

## 📐 Diagrama de Entornos

```
┌─────────────────────────────────────────────────────────────────┐
│                         DESARROLLO                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Frontend Dev   │              │   Backend Dev    │        │
│  │   Next.js        │─────────────▶│   Express API    │        │
│  │   Port: 3000     │   HTTP       │   Port: 3001     │        │
│  └──────────────────┘              └──────────────────┘        │
│         │                                    │                  │
│         │                                    │                  │
│         │                                    ▼                  │
│         │                          ┌──────────────────┐        │
│         │                          │   PostgreSQL     │        │
│         │                          │   Port: 5433     │        │
│         │                          │   DB: dev        │        │
│         │                          └──────────────────┘        │
│         │                                                       │
│         └─────────────────────────────────────────────────────┘
│
│
├─────────────────────────────────────────────────────────────────┤
│                         PRODUCCIÓN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Frontend Prod   │              │  Backend Prod    │        │
│  │  Next.js Build   │─────────────▶│  Express API     │        │
│  │  Port: 3002      │   HTTP       │  Port: 3003      │        │
│  │  (PM2)           │              │  (PM2 Cluster)   │        │
│  └──────────────────┘              └──────────────────┘        │
│         │                                    │                  │
│         │                                    │                  │
│         │                                    ▼                  │
│         │                          ┌──────────────────┐        │
│         │                          │   PostgreSQL     │        │
│         │                          │   Port: 5432     │        │
│         │                          │   DB: prod       │        │
│         │                          └──────────────────┘        │
│         │                                                       │
│         └─────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TailwindCSS
- **Componentes**: shadcn/ui
- **Estado**: Zustand
- **Gráficos**: Recharts
- **HTTP**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Autenticación**: JWT
- **Validación**: Express Validator
- **Seguridad**: Helmet, CORS

### Base de Datos
- **DBMS**: PostgreSQL 14+
- **Migraciones**: Prisma Migrate
- **Schemas**: Multi-módulo

### DevOps
- **Gestor de Procesos**: PM2
- **Control de Versiones**: Git
- **Logs**: PM2 + archivos

## 📊 Flujo de Datos

```
┌─────────┐     HTTP      ┌─────────┐    Prisma    ┌──────────┐
│ Browser │──────────────▶│ Express │─────────────▶│ Postgres │
│         │               │   API   │              │          │
└─────────┘               └─────────┘              └──────────┘
     │                          │                        │
     │                          │                        │
     │    JSON Response         │     Query Results     │
     │◀─────────────────────────│◀──────────────────────│
     │                          │                        │
```

## 🔐 Seguridad

### Capas de Seguridad
1. **Autenticación**: JWT tokens
2. **Autorización**: Role-based access control (RBAC)
3. **CORS**: Configurado por entorno
4. **Rate Limiting**: Protección contra ataques
5. **Helmet**: Headers de seguridad HTTP
6. **Validación**: Input sanitization

### Roles del Sistema
- `SUPER_ADMIN`: Acceso total
- `ADMIN`: Gestión administrativa
- `DIRECTOR`: Supervisión de departamentos
- `COORDINADOR`: Gestión operativa
- `EMPLEADO`: Operaciones básicas
- `CIUDADANO`: Portal ciudadano

## 📁 Estructura de Directorios

```
alcaldia-saas/
├── backend/
│   ├── src/
│   │   ├── modules/          # Módulos funcionales
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── finance/
│   │   │   ├── hr/
│   │   │   ├── tax/
│   │   │   └── ...
│   │   ├── shared/           # Código compartido
│   │   │   ├── middlewares/
│   │   │   ├── utils/
│   │   │   └── validators/
│   │   ├── config/           # Configuraciones
│   │   └── server.js         # Entry point
│   ├── prisma/
│   │   └── schema.prisma     # Schema de BD
│   ├── .env                  # Dev config
│   ├── .env.production       # Prod config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   └── ...
│   │   ├── components/       # Componentes React
│   │   │   ├── ui/           # shadcn/ui
│   │   │   └── ...
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilidades
│   │   ├── store/            # Zustand stores
│   │   └── constants/        # Constantes
│   ├── .env.local            # Dev config
│   ├── .env.production       # Prod config
│   └── package.json
│
├── scripts/                  # Scripts de deployment
│   ├── deploy-production.sh
│   ├── restart-production.sh
│   ├── stop-production.sh
│   └── status.sh
│
├── logs/                     # Logs de PM2
├── ecosystem.config.js       # Configuración PM2
├── README-DEPLOYMENT.md      # Guía de despliegue
└── QUICK-START.md           # Inicio rápido
```

## 🔄 Ciclo de Vida del Desarrollo

### Desarrollo Local
1. Clonar repositorio
2. Instalar dependencias (`npm install`)
3. Configurar `.env` files
4. Ejecutar migraciones (`npx prisma migrate dev`)
5. Iniciar dev servers (`npm run dev`)

### Despliegue a Producción
1. Build del frontend (`npm run build`)
2. Ejecutar migraciones (`prisma migrate deploy`)
3. Iniciar con PM2 (`pm2 start ecosystem.config.js --env production`)
4. Verificar estado (`pm2 status`)

### Actualización
1. Pull de cambios (`git pull`)
2. Re-desplegar (`./scripts/deploy-production.sh`)
3. Verificar (`./scripts/status.sh`)

## 🌐 Puertos y URLs

| Entorno    | Servicio | Puerto | URL                              |
|------------|----------|--------|----------------------------------|
| Desarrollo | Frontend | 3000   | http://localhost:3000            |
| Desarrollo | Backend  | 3001   | http://localhost:3001            |
| Desarrollo | DB       | 5433   | postgresql://localhost:5433      |
| Producción | Frontend | 3002   | http://147.93.184.19:3002        |
| Producción | Backend  | 3003   | http://147.93.184.19:3003        |
| Producción | DB       | 5432   | postgresql://localhost:5432      |

## 📈 Escalabilidad

### Backend (PM2 Cluster Mode)
- Múltiples instancias (1 por CPU)
- Load balancing automático
- Zero-downtime restarts
- Auto-restart en crashes

### Frontend (Next.js)
- Server-side rendering (SSR)
- Static generation (SSG)
- Image optimization
- Code splitting automático

### Base de Datos
- Índices optimizados
- Connection pooling (Prisma)
- Query optimization
- Backups automáticos

## 🔍 Monitoreo

### PM2
```bash
pm2 monit              # Dashboard en tiempo real
pm2 logs               # Logs en tiempo real
pm2 status             # Estado de procesos
```

### Logs
- Backend: `logs/backend-out.log`, `logs/backend-error.log`
- Frontend: `logs/frontend-out.log`, `logs/frontend-error.log`

### Health Checks
- Backend: `GET /health`
- Database: Prisma connection check

## 🚨 Troubleshooting

Ver [README-DEPLOYMENT.md](./README-DEPLOYMENT.md#troubleshooting) para guía detallada de resolución de problemas.
