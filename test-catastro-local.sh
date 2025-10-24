#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración - LOCALHOST
API_URL="http://localhost:3001/api"
EMAIL="admin@municipal.gob.ve"
PASSWORD="Admin123!"

echo "========================================="
echo "TEST CATASTRO - LOCALHOST"
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
echo ""

# Contadores
TOTAL=0
SUCCESS=0
FAILED=0

# Función para probar endpoints
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X $method "${API_URL}${endpoint}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    ((TOTAL++))
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ $HTTP_CODE${NC}"
        ((SUCCESS++))
        return 0
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${RED}❌ $HTTP_CODE - Not Found${NC}"
        echo "   URL: ${API_URL}${endpoint}"
        ((FAILED++))
        return 1
    elif [ "$HTTP_CODE" = "500" ]; then
        echo -e "${RED}❌ $HTTP_CODE - Server Error${NC}"
        echo "   Error: $(echo $BODY | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
        ((FAILED++))
        return 1
    else
        echo -e "${YELLOW}⚠️  $HTTP_CODE${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "========================================="
echo "PROBANDO ENDPOINTS DE CATASTRO"
echo "========================================="
echo ""

echo "--- Propiedades ---"
test_endpoint "GET" "/catastro/properties" "GET /properties"
test_endpoint "GET" "/catastro/properties/stats" "GET /properties/stats"
test_endpoint "GET" "/catastro/properties/search/location?latitude=10.5&longitude=-66.9&radius=5" "GET /properties/search/location"
echo ""

echo "--- Variables Urbanas ---"
test_endpoint "GET" "/catastro/urban-variables" "GET /urban-variables"
test_endpoint "GET" "/catastro/urban-variables/stats" "GET /urban-variables/stats"
echo ""

echo "--- Permisos de Construcción ---"
test_endpoint "GET" "/catastro/construction-permits" "GET /construction-permits"
test_endpoint "GET" "/catastro/construction-permits/stats" "GET /construction-permits/stats"
echo ""

echo "--- Inspecciones Urbanas ---"
test_endpoint "GET" "/catastro/urban-inspections" "GET /urban-inspections"
test_endpoint "GET" "/catastro/urban-inspections/stats" "GET /urban-inspections/stats"
echo ""

echo "========================================="
echo "RESUMEN"
echo "========================================="
echo "Total: $TOTAL"
echo -e "${GREEN}Exitosos: $SUCCESS${NC}"
echo -e "${RED}Fallidos: $FAILED${NC}"
PERCENT=$((SUCCESS * 100 / TOTAL))
echo "Porcentaje de éxito: ${PERCENT}%"
echo ""
