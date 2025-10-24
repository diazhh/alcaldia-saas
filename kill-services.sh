#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "DETENIENDO SERVICIOS"
echo "========================================="
echo ""

# Función para matar procesos en un puerto
kill_port() {
    local port=$1
    local service=$2
    
    echo -n "Buscando procesos en puerto $port ($service)... "
    
    # Buscar PIDs en el puerto
    PIDS=$(lsof -ti :$port 2>/dev/null)
    
    if [ -z "$PIDS" ]; then
        echo -e "${YELLOW}No hay procesos corriendo${NC}"
        return 0
    fi
    
    echo -e "${GREEN}Encontrados${NC}"
    
    # Matar cada PID
    for PID in $PIDS; do
        echo -n "  Matando proceso $PID... "
        kill -9 $PID 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
        fi
    done
}

# Matar backend (puerto 3001)
echo "--- Backend ---"
kill_port 3001 "Backend API"
echo ""

# Matar frontend (puerto 3000)
echo "--- Frontend ---"
kill_port 3000 "Frontend Next.js"
echo ""

# Verificar que los puertos estén libres
echo "========================================="
echo "VERIFICACIÓN"
echo "========================================="
echo ""

check_port() {
    local port=$1
    local service=$2
    
    echo -n "Puerto $port ($service): "
    
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${RED}AÚN OCUPADO${NC}"
        lsof -i :$port
        return 1
    else
        echo -e "${GREEN}LIBRE${NC}"
        return 0
    fi
}

check_port 3001 "Backend"
check_port 3000 "Frontend"

echo ""
echo -e "${GREEN}Servicios detenidos correctamente${NC}"
