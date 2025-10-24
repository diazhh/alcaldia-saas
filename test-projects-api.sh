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
echo "AUDITORÍA MÓDULO DE PROYECTOS"
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
echo "2. PROBANDO ENDPOINTS DE PROYECTOS"
echo "========================================="
echo ""

# Proyectos principales
echo "--- Proyectos Principales ---"
test_endpoint "GET" "/projects/stats/general" "GET /projects/stats/general"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects" "GET /projects"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects?page=1&limit=10" "GET /projects (paginado)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects?status=IN_PROGRESS" "GET /projects (filtro status)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

echo ""

# Obtener ID de un proyecto para pruebas
PROJECT_ID=$(curl -s -X GET "${API_URL}/projects?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PROJECT_ID" ]; then
    echo "Proyecto de prueba ID: $PROJECT_ID"
    echo ""
    
    echo "--- Proyecto Individual ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}" "GET /projects/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Hitos (Milestones) ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/milestones" "GET /projects/:id/milestones"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Gastos (Expenses) ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/expenses" "GET /projects/:id/expenses"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/expenses/stats" "GET /projects/:id/expenses/stats"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Fotos ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos" "GET /projects/:id/photos"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos?type=BEFORE" "GET /projects/:id/photos (filtro)"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos/count" "GET /projects/:id/photos/count"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Contratos ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/contracts" "GET /projects/:id/contracts"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Documentos ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/documents" "GET /projects/:id/documents"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/documents/count" "GET /projects/:id/documents/count"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Reportes de Avance ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/progress-reports" "GET /projects/:id/progress-reports"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/progress-reports/latest" "GET /projects/:id/progress-reports/latest"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/progress-reports/stats" "GET /projects/:id/progress-reports/stats"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Inspecciones ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/inspections" "GET /projects/:id/inspections"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Órdenes de Cambio ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/change-orders" "GET /projects/:id/change-orders"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
fi

echo "--- Contratistas ---"
test_endpoint "GET" "/projects/contractors" "GET /projects/contractors"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects/contractors/stats" "GET /projects/contractors/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

echo "--- Contratos Globales ---"
test_endpoint "GET" "/projects/contracts" "GET /projects/contracts"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects/contracts/stats" "GET /projects/contracts/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

echo "--- Inspecciones Globales ---"
test_endpoint "GET" "/projects/inspections" "GET /projects/inspections"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects/inspections/stats" "GET /projects/inspections/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

echo "--- Órdenes de Cambio Globales ---"
test_endpoint "GET" "/projects/change-orders" "GET /projects/change-orders"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects/change-orders/stats" "GET /projects/change-orders/stats"
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
