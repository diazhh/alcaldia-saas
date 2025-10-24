#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://147.93.184.19:3001/api"
EMAIL="admin@municipal.gob.ve"
PASSWORD="Admin123!"

echo "========================================="
echo "AUDITORÍA MÓDULO DE ORGANIZACIÓN"
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
echo "2. PROBANDO ENDPOINTS DE ORGANIZACIÓN"
echo "========================================="
echo ""

# Reportes y estadísticas
echo "--- Reportes y Estadísticas ---"
test_endpoint "GET" "/departments/reports/stats" "GET /departments/reports/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments/reports/employees" "GET /departments/reports/employees"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments/reports/without-head" "GET /departments/reports/without-head"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments/reports/users-without-dept" "GET /departments/reports/users-without-dept"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments/reports/staff-distribution" "GET /departments/reports/staff-distribution"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments/reports/org-chart" "GET /departments/reports/org-chart"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments/reports/phone-directory" "GET /departments/reports/phone-directory"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# Departamentos principales
echo "--- Departamentos Principales ---"
test_endpoint "GET" "/departments/tree" "GET /departments/tree"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments" "GET /departments"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments?hierarchical=true" "GET /departments (jerárquico)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/departments?page=1&limit=10" "GET /departments (paginado)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# Obtener ID de un departamento para pruebas
DEPT_ID=$(curl -s -X GET "${API_URL}/departments?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$DEPT_ID" ]; then
    echo "Departamento de prueba ID: $DEPT_ID"
    echo ""
    
    echo "--- Departamento Individual ---"
    test_endpoint "GET" "/departments/${DEPT_ID}" "GET /departments/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/departments/${DEPT_ID}/ancestors" "GET /departments/:id/ancestors"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/departments/${DEPT_ID}/descendants" "GET /departments/:id/descendants"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/departments/${DEPT_ID}/path" "GET /departments/:id/path"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/departments/${DEPT_ID}/stats" "GET /departments/:id/stats"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/departments/${DEPT_ID}/children" "GET /departments/:id/children"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/departments/${DEPT_ID}/staff" "GET /departments/:id/staff"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Usuarios del Departamento ---"
    test_endpoint "GET" "/departments/${DEPT_ID}/users" "GET /departments/:id/users"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Permisos del Departamento ---"
    test_endpoint "GET" "/departments/${DEPT_ID}/permissions" "GET /departments/:id/permissions"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
fi

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
