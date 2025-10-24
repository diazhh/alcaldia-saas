#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://147.93.184.19:3001/api"
EMAIL="admin@municipal.gob.ve"
PASSWORD="Admin123!"

echo "========================================="
echo "AUDITORÍA COMPLETA MÓDULO CATASTRO/PROYECTOS"
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
    elif [ "$method" = "PUT" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${API_URL}${endpoint}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json" \
          -d "$data")
    elif [ "$method" = "PATCH" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "${API_URL}${endpoint}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json" \
          -d "$data")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ $HTTP_CODE${NC}"
        echo "$BODY" > /tmp/last_response.json
        return 0
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${RED}❌ $HTTP_CODE - Not Found${NC}"
        echo "   Endpoint: ${endpoint}"
        echo "   Body: $BODY" | head -c 200
        return 1
    elif [ "$HTTP_CODE" = "501" ]; then
        echo -e "${YELLOW}⚠️  $HTTP_CODE - Not Implemented${NC}"
        echo "   Endpoint: ${endpoint}"
        return 2
    elif [ "$HTTP_CODE" = "500" ]; then
        echo -e "${RED}❌ $HTTP_CODE - Server Error${NC}"
        echo "   Endpoint: ${endpoint}"
        echo "   Error: $(echo $BODY | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
        echo "   Body: $BODY" | head -c 300
        return 3
    else
        echo -e "${YELLOW}⚠️  $HTTP_CODE${NC}"
        echo "   Endpoint: ${endpoint}"
        echo "   Body: $BODY" | head -c 200
        return 4
    fi
}

# Contadores
TOTAL=0
SUCCESS=0
FAILED=0
NOT_IMPL=0

echo "========================================="
echo "2. PROBANDO ENDPOINTS IDENTIFICADOS EN useProjects.js"
echo "========================================="
echo ""

# Endpoints del hook useProjects
echo "--- Estadísticas Generales ---"
test_endpoint "GET" "/projects/stats/general" "GET /projects/stats/general"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

echo "--- Lista de Proyectos ---"
test_endpoint "GET" "/projects" "GET /projects"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects?page=1&limit=10" "GET /projects (paginado)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/projects?status=IN_PROGRESS" "GET /projects (filtro status)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# Obtener ID de un proyecto para pruebas
echo "--- Obteniendo proyecto de prueba ---"
PROJECT_ID=$(curl -s -X GET "${API_URL}/projects?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PROJECT_ID" ]; then
    echo -e "${BLUE}Proyecto de prueba ID: $PROJECT_ID${NC}"
    echo ""
    
    echo "--- Proyecto Individual (useProject) ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}" "GET /projects/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Hitos/Milestones (useMilestones) ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/milestones" "GET /projects/:id/milestones"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    # Obtener ID de milestone si existe
    MILESTONE_ID=$(curl -s -X GET "${API_URL}/projects/${PROJECT_ID}/milestones" \
      -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ ! -z "$MILESTONE_ID" ]; then
        echo -e "${BLUE}Milestone de prueba ID: $MILESTONE_ID${NC}"
        test_endpoint "PATCH" "/projects/milestones/${MILESTONE_ID}/progress" "PATCH /projects/milestones/:id/progress" '{"progress":50}'
        ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    fi
    echo ""
    
    echo "--- Gastos/Expenses (useExpenses, useExpenseStats) ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/expenses" "GET /projects/:id/expenses"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/expenses/stats" "GET /projects/:id/expenses/stats"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
    
    echo "--- Fotos (usePhotos) ---"
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos" "GET /projects/:id/photos"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos?type=BEFORE" "GET /projects/:id/photos (filtro type)"
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
else
    echo -e "${YELLOW}⚠️  No se encontraron proyectos para probar endpoints específicos${NC}"
    echo ""
fi

echo "--- Contratistas Globales ---"
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
echo "RESUMEN DE AUDITORÍA"
echo "========================================="
echo -e "Total de endpoints probados: ${TOTAL}"
echo -e "${GREEN}Exitosos (200/201): ${SUCCESS}${NC}"
echo -e "${RED}Fallidos (404/500): ${FAILED}${NC}"
echo -e "${YELLOW}No implementados (501): ${NOT_IMPL}${NC}"
echo ""

if [ $TOTAL -gt 0 ]; then
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
else
    echo -e "${RED}❌ No se pudieron probar endpoints${NC}"
fi

echo ""
echo "========================================="
echo "ENDPOINTS REQUERIDOS POR EL FRONTEND"
echo "========================================="
echo "Basado en useProjects.js:"
echo "1. GET /projects/stats/general - useProjectStats()"
echo "2. GET /projects - useProjects()"
echo "3. GET /projects/:id - useProject()"
echo "4. GET /projects/:id/milestones - useMilestones()"
echo "5. PATCH /projects/milestones/:id/progress - useUpdateMilestoneProgress()"
echo "6. GET /projects/:id/expenses - useExpenses()"
echo "7. GET /projects/:id/expenses/stats - useExpenseStats()"
echo "8. GET /projects/:id/photos - usePhotos()"
echo "9. POST /projects - useCreateProject()"
echo "10. PUT /projects/:id - useUpdateProject()"
echo "11. DELETE /projects/:id - useDeleteProject()"
echo "12. POST /projects/:id/milestones - useCreateMilestone()"
echo "13. POST /projects/:id/expenses - useCreateExpense()"
echo "14. POST /projects/:id/photos - useUploadPhoto()"
echo ""
