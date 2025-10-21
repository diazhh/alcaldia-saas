# Backend Dockerfile
FROM node:18-alpine AS base

# Instalar dependencias necesarias para Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Instalar todas las dependencias (incluyendo dev) para build
FROM base AS build-dependencies
RUN npm ci

# Build stage
FROM build-dependencies AS build
COPY . .
# Generar Prisma Client
RUN npx prisma generate

# Production stage
FROM base AS production

# Copiar node_modules de producción
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]
