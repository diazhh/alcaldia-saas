#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
API_URL="http://147.93.184.19:3001/api"
EMAIL="admin@municipal.gob.ve"
PASSWORD="Admin123!"

echo "========================================="
echo "DEBUG MÓDULO CATASTRO - 404 ERRORS"
echo "========================================="
echo ""

# 1. Autenticación
echo "1. Autenticando..."
AUTH_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error en autenticación${NC}"
    echo "Respuesta: $AUTH_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Autenticación exitosa${NC}"
echo "Token: ${TOKEN:0:30}..."
echo ""

# Función para probar endpoints
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo "========================================="
    echo "Testing: $description"
    echo "URL: ${API_URL}${endpoint}"
    echo "========================================="
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method "${API_URL}${endpoint}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')
    
    echo "Status Code: $HTTP_CODE"
    echo "Response Body:"
    echo "$BODY" | head -c 500
    echo ""
    echo ""
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    echo ""
}

# Probar endpoints principales
echo "========================================="
echo "PROBANDO ENDPOINTS DE CATASTRO"
echo "========================================="
echo ""

test_endpoint "GET" "/catastro/properties" "GET /catastro/properties"
test_endpoint "GET" "/catastro/properties/stats" "GET /catastro/properties/stats"
test_endpoint "GET" "/catastro/urban-variables" "GET /catastro/urban-variables"
test_endpoint "GET" "/catastro/construction-permits" "GET /catastro/construction-permits"
test_endpoint "GET" "/catastro/urban-inspections" "GET /catastro/urban-inspections"

echo "========================================="
echo "VERIFICANDO RUTAS EN SERVIDOR"
echo "========================================="
echo ""
echo "Verificando si el servidor está corriendo..."
curl -s http://147.93.184.19:3001/health | head -c 200
echo ""
echo ""
