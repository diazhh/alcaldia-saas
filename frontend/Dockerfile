# Frontend Dockerfile
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

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

# Copiar código fuente
COPY . .

# Variables de entorno necesarias para el build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build de Next.js
RUN npm run build

# Production stage
FROM base AS production

# Copiar node_modules de producción
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar archivos de build
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.js ./next.config.js

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["npm", "start"]
