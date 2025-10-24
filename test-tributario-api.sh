#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://147.93.184.19:3003/api"
EMAIL="admin@municipal.gob.ve"
PASSWORD="Admin123!"

echo "========================================="
echo "AUDITORÍA MÓDULO TRIBUTARIO"
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
echo "Token: ${TOKEN:0:20}..."
echo ""

# Función para probar endpoints
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}${endpoint}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json")
    elif [ "$method" = "POST" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}${endpoint}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json" \
          -d "$data")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ $HTTP_CODE${NC}"
        return 0
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${RED}❌ $HTTP_CODE - Not Found${NC}"
        echo "   Endpoint: ${endpoint}"
        return 1
    elif [ "$HTTP_CODE" = "501" ]; then
        echo -e "${YELLOW}⚠️  $HTTP_CODE - Not Implemented${NC}"
        echo "   Endpoint: ${endpoint}"
        return 2
    elif [ "$HTTP_CODE" = "500" ]; then
        echo -e "${RED}❌ $HTTP_CODE - Server Error${NC}"
        echo "   Endpoint: ${endpoint}"
        echo "   Error: $(echo $BODY | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
        return 3
    else
        echo -e "${YELLOW}⚠️  $HTTP_CODE${NC}"
        echo "   Endpoint: ${endpoint}"
        return 4
    fi
}

# Contadores
TOTAL=0
SUCCESS=0
FAILED=0
NOT_IMPL=0

echo "========================================="
echo "2. PROBANDO ENDPOINTS DE TRIBUTARIO"
echo "========================================="
echo ""

# ============================================
# CONTRIBUYENTES
# ============================================
echo "--- Contribuyentes ---"
test_endpoint "GET" "/tax/taxpayers" "GET /tax/taxpayers"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

# Obtener ID de un contribuyente para pruebas
TAXPAYER_ID=$(curl -s -X GET "${API_URL}/tax/taxpayers" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$TAXPAYER_ID" ]; then
    test_endpoint "GET" "/tax/taxpayers/${TAXPAYER_ID}" "GET /tax/taxpayers/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/tax/taxpayers/${TAXPAYER_ID}/account-status" "GET /tax/taxpayers/:id/account-status"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/tax/taxpayers/${TAXPAYER_ID}/is-solvent" "GET /tax/taxpayers/:id/is-solvent"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# NEGOCIOS (PATENTES)
# ============================================
echo "--- Negocios/Patentes ---"
test_endpoint "GET" "/tax/businesses" "GET /tax/businesses"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

BUSINESS_ID=$(curl -s -X GET "${API_URL}/tax/businesses" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$BUSINESS_ID" ]; then
    test_endpoint "GET" "/tax/businesses/${BUSINESS_ID}" "GET /tax/businesses/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# INMUEBLES
# ============================================
echo "--- Inmuebles ---"
test_endpoint "GET" "/tax/properties" "GET /tax/properties"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

PROPERTY_ID=$(curl -s -X GET "${API_URL}/tax/properties" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PROPERTY_ID" ]; then
    test_endpoint "GET" "/tax/properties/${PROPERTY_ID}" "GET /tax/properties/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# VEHÍCULOS
# ============================================
echo "--- Vehículos ---"
test_endpoint "GET" "/tax/vehicles" "GET /tax/vehicles"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

VEHICLE_ID=$(curl -s -X GET "${API_URL}/tax/vehicles" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$VEHICLE_ID" ]; then
    test_endpoint "GET" "/tax/vehicles/${VEHICLE_ID}" "GET /tax/vehicles/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# TASAS
# ============================================
echo "--- Tasas ---"
test_endpoint "GET" "/tax/fees" "GET /tax/fees"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/fees/statistics" "GET /tax/fees/statistics"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

FEE_ID=$(curl -s -X GET "${API_URL}/tax/fees" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$FEE_ID" ]; then
    test_endpoint "GET" "/tax/fees/${FEE_ID}" "GET /tax/fees/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# PAGOS
# ============================================
echo "--- Pagos ---"
if [ ! -z "$TAXPAYER_ID" ]; then
    test_endpoint "GET" "/tax/payments/history/${TAXPAYER_ID}" "GET /tax/payments/history/:taxpayerId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# COBRANZA
# ============================================
echo "--- Cobranza ---"
test_endpoint "GET" "/tax/collections" "GET /tax/collections"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/collections/statistics" "GET /tax/collections/statistics"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

COLLECTION_ID=$(curl -s -X GET "${API_URL}/tax/collections" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$COLLECTION_ID" ]; then
    test_endpoint "GET" "/tax/collections/${COLLECTION_ID}" "GET /tax/collections/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# SOLVENCIAS
# ============================================
echo "--- Solvencias ---"
test_endpoint "GET" "/tax/solvencies" "GET /tax/solvencies"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/solvencies/statistics" "GET /tax/solvencies/statistics"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/solvencies/expiring" "GET /tax/solvencies/expiring"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

if [ ! -z "$TAXPAYER_ID" ]; then
    test_endpoint "GET" "/tax/solvencies/check/${TAXPAYER_ID}" "GET /tax/solvencies/check/:taxpayerId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi

SOLVENCY_ID=$(curl -s -X GET "${API_URL}/tax/solvencies" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$SOLVENCY_ID" ]; then
    test_endpoint "GET" "/tax/solvencies/${SOLVENCY_ID}" "GET /tax/solvencies/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# ESTADÍSTICAS Y DASHBOARD
# ============================================
echo "--- Estadísticas y Dashboard ---"
test_endpoint "GET" "/tax/statistics/dashboard" "GET /tax/statistics/dashboard"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/statistics/general" "GET /tax/statistics/general"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/statistics/monthly-collection" "GET /tax/statistics/monthly-collection"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/statistics/tax-type-distribution" "GET /tax/statistics/tax-type-distribution"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/statistics/top-contributors" "GET /tax/statistics/top-contributors"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/statistics/alerts" "GET /tax/statistics/alerts"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# ============================================
# REPORTES
# ============================================
echo "--- Reportes ---"
test_endpoint "GET" "/tax/reports/types" "GET /tax/reports/types"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/tax/reports/stats" "GET /tax/reports/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# Resumen
echo "========================================="
echo "RESUMEN DE PRUEBAS"
echo "========================================="
echo -e "Total de endpoints probados: ${TOTAL}"
echo -e "${GREEN}Exitosos (200/201): ${SUCCESS}${NC}"
echo -e "${RED}Fallidos (404/500): ${FAILED}${NC}"
echo -e "${YELLOW}No implementados (501): ${NOT_IMPL}${NC}"
echo ""

PERCENTAGE=$((SUCCESS * 100 / TOTAL))
echo -e "Porcentaje de éxito: ${PERCENTAGE}%"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 ¡Todos los endpoints funcionan correctamente!${NC}"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  La mayoría de endpoints funcionan, pero hay algunos problemas${NC}"
else
    echo -e "${RED}❌ Hay problemas significativos con los endpoints${NC}"
fi
