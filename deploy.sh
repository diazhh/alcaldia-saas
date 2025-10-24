#!/bin/bash

###############################################################################
# 🚀 DEPLOY ÚNICO - Compila y despliega todo en producción
# Usa la misma base de datos de desarrollo
###############################################################################

set -e

echo "🚀 Desplegando a Producción"
echo "============================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ==========================================
# 1. BACKEND - COPIAR A PRODUCCIÓN
# ==========================================
echo -e "${BLUE}🔧 Backend...${NC}"

echo "  → Limpiando carpeta de producción..."
rm -rf "$PROJECT_ROOT/backend-prod"/*
rm -rf "$PROJECT_ROOT/backend-prod"/.[!.]* 2>/dev/null || true

echo "  → Copiando código a backend-prod..."
cp -r "$PROJECT_ROOT/backend"/* "$PROJECT_ROOT/backend-prod/"
cp -r "$PROJECT_ROOT/backend"/.[!.]* "$PROJECT_ROOT/backend-prod/" 2>/dev/null || true

cd "$PROJECT_ROOT/backend-prod"

echo "  → Instalando dependencias..."
npm ci --only=production 2>&1 | grep -E "(added|removed|up to date)" || true

echo "  → Generando Prisma client..."
npx prisma generate > /dev/null 2>&1

echo -e "${GREEN}  ✅ Backend de producción listo${NC}"
echo ""

# ==========================================
# 2. FRONTEND - COPIAR A PRODUCCIÓN
# ==========================================
echo -e "${BLUE}🎨 Frontend...${NC}"

echo "  → Limpiando carpeta de producción..."
rm -rf "$PROJECT_ROOT/frontend-prod"/*
rm -rf "$PROJECT_ROOT/frontend-prod"/.[!.]* 2>/dev/null || true

echo "  → Copiando código a frontend-prod..."
cp -r "$PROJECT_ROOT/frontend"/* "$PROJECT_ROOT/frontend-prod/"
cp -r "$PROJECT_ROOT/frontend"/.[!.]* "$PROJECT_ROOT/frontend-prod/" 2>/dev/null || true

cd "$PROJECT_ROOT/frontend-prod"

echo "  → Instalando dependencias..."
npm ci 2>&1 | grep -E "(added|removed|up to date)" || true

echo "  → Limpiando build anterior..."
rm -rf .next

echo "  → Compilando (API: http://147.93.184.19:3003)..."
export NEXT_PUBLIC_API_URL=http://147.93.184.19:3003
export NODE_ENV=production
npm run build 2>&1 | tail -n 20

echo -e "${GREEN}  ✅ Frontend de producción compilado${NC}"
echo ""

# ==========================================
# 3. PM2 - REINICIAR
# ==========================================
echo -e "${BLUE}🔄 PM2...${NC}"
cd "$PROJECT_ROOT"

# Detener solo las aplicaciones municipales (NO tocar fuxa-root ni otros)
pm2 delete municipal-backend-prod 2>/dev/null || true
pm2 delete municipal-frontend-prod 2>/dev/null || true

# Iniciar
echo "  → Iniciando aplicaciones..."
pm2 start ecosystem.config.js --env production

# Guardar
pm2 save --force > /dev/null 2>&1

echo -e "${GREEN}  ✅ PM2 actualizado${NC}"
echo ""

# ==========================================
# RESUMEN
# ==========================================
echo -e "${GREEN}✅ ¡Deploy completado!${NC}"
echo ""
echo "📊 Estado:"
pm2 list
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://147.93.184.19:3002"
echo "   Backend:  http://147.93.184.19:3003"
echo ""
echo "📝 Comandos útiles:"
echo "   pm2 logs              - Ver logs"
echo "   pm2 restart all       - Reiniciar"
echo "   pm2 stop all          - Detener"
echo ""
