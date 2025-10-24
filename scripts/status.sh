#!/bin/bash

###############################################################################
# Script para verificar el estado de las aplicaciones
###############################################################################

echo "📊 Estado de las Aplicaciones"
echo "================================"
echo ""

# Estado de PM2
echo "🔹 Aplicaciones PM2:"
pm2 status
echo ""

# Verificar puertos
echo "🔹 Puertos en uso:"
echo "   Desarrollo:"
echo "     - Frontend (3000): $(lsof -i :3000 2>/dev/null | grep LISTEN | wc -l) proceso(s)"
echo "     - Backend (3001):  $(lsof -i :3001 2>/dev/null | grep LISTEN | wc -l) proceso(s)"
echo ""
echo "   Producción:"
echo "     - Frontend (3002): $(lsof -i :3002 2>/dev/null | grep LISTEN | wc -l) proceso(s)"
echo "     - Backend (3003):  $(lsof -i :3003 2>/dev/null | grep LISTEN | wc -l) proceso(s)"
echo ""

# Verificar conectividad
echo "🔹 Health Checks:"

# Backend desarrollo
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend Dev (3001): OK"
else
    echo "   ❌ Backend Dev (3001): No responde"
fi

# Backend producción
if curl -s http://localhost:3003/health > /dev/null 2>&1; then
    echo "   ✅ Backend Prod (3003): OK"
else
    echo "   ❌ Backend Prod (3003): No responde"
fi

echo ""
echo "🔹 URLs:"
echo "   Desarrollo:"
echo "     - Frontend: http://localhost:3000"
echo "     - Backend:  http://localhost:3001"
echo ""
echo "   Producción:"
echo "     - Frontend: http://147.93.184.19:3002"
echo "     - Backend:  http://147.93.184.19:3003"
echo ""
