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
echo "AUDITORÍA DETALLADA - MÓDULO DE PROYECTOS"
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

# Arrays para almacenar resultados
declare -a PASSED_ENDPOINTS
declare -a FAILED_ENDPOINTS

# Función para probar endpoints
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}${endpoint}" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅${NC} $description"
        PASSED_ENDPOINTS+=("$description")
        return 0
    else
        echo -e "${RED}❌${NC} $description - HTTP $HTTP_CODE"
        FAILED_ENDPOINTS+=("$description|$endpoint|$HTTP_CODE")
        if [ "$HTTP_CODE" = "500" ]; then
            ERROR_MSG=$(echo $BODY | grep -o '"message":"[^"]*' | cut -d'"' -f4)
            echo -e "   ${YELLOW}Error: $ERROR_MSG${NC}"
        fi
        return 1
    fi
}

echo "========================================="
echo "2. PROBANDO TODOS LOS ENDPOINTS"
echo "========================================="
echo ""

# Obtener ID de un proyecto para pruebas
PROJECT_ID=$(curl -s -X GET "${API_URL}/projects?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No hay proyectos en la base de datos para probar endpoints específicos${NC}"
    echo ""
fi

# Proyectos principales
test_endpoint "GET" "/projects/stats/general" "GET /projects/stats/general"
test_endpoint "GET" "/projects" "GET /projects"
test_endpoint "GET" "/projects?page=1&limit=10" "GET /projects (paginado)"
test_endpoint "GET" "/projects?status=IN_PROGRESS" "GET /projects (filtro status)"

if [ ! -z "$PROJECT_ID" ]; then
    echo ""
    echo -e "${BLUE}Usando proyecto ID: $PROJECT_ID${NC}"
    echo ""
    
    # Proyecto individual
    test_endpoint "GET" "/projects/${PROJECT_ID}" "GET /projects/:id"
    
    # Hitos
    test_endpoint "GET" "/projects/${PROJECT_ID}/milestones" "GET /projects/:id/milestones"
    
    # Gastos
    test_endpoint "GET" "/projects/${PROJECT_ID}/expenses" "GET /projects/:id/expenses"
    test_endpoint "GET" "/projects/${PROJECT_ID}/expenses/stats" "GET /projects/:id/expenses/stats"
    
    # Fotos
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos" "GET /projects/:id/photos"
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos?type=BEFORE" "GET /projects/:id/photos (filtro)"
    test_endpoint "GET" "/projects/${PROJECT_ID}/photos/count" "GET /projects/:id/photos/count"
    
    # Contratos
    test_endpoint "GET" "/projects/${PROJECT_ID}/contracts" "GET /projects/:id/contracts"
    
    # Documentos
    test_endpoint "GET" "/projects/${PROJECT_ID}/documents" "GET /projects/:id/documents"
    test_endpoint "GET" "/projects/${PROJECT_ID}/documents/count" "GET /projects/:id/documents/count"
    
    # Reportes de avance
    test_endpoint "GET" "/projects/${PROJECT_ID}/progress-reports" "GET /projects/:id/progress-reports"
    test_endpoint "GET" "/projects/${PROJECT_ID}/progress-reports/latest" "GET /projects/:id/progress-reports/latest"
    test_endpoint "GET" "/projects/${PROJECT_ID}/progress-reports/stats" "GET /projects/:id/progress-reports/stats"
    
    # Inspecciones
    test_endpoint "GET" "/projects/${PROJECT_ID}/inspections" "GET /projects/:id/inspections"
    
    # Órdenes de cambio
    test_endpoint "GET" "/projects/${PROJECT_ID}/change-orders" "GET /projects/:id/change-orders"
fi

# Contratistas
test_endpoint "GET" "/projects/contractors" "GET /projects/contractors"
test_endpoint "GET" "/projects/contractors/stats" "GET /projects/contractors/stats"

# Contratos globales
test_endpoint "GET" "/projects/contracts" "GET /projects/contracts"
test_endpoint "GET" "/projects/contracts/stats" "GET /projects/contracts/stats"

# Inspecciones globales
test_endpoint "GET" "/projects/inspections" "GET /projects/inspections"
test_endpoint "GET" "/projects/inspections/stats" "GET /projects/inspections/stats"

# Órdenes de cambio globales
test_endpoint "GET" "/projects/change-orders" "GET /projects/change-orders"
test_endpoint "GET" "/projects/change-orders/stats" "GET /projects/change-orders/stats"

# Resumen
echo ""
echo "========================================="
echo "RESUMEN DE PRUEBAS"
echo "========================================="

TOTAL=$((${#PASSED_ENDPOINTS[@]} + ${#FAILED_ENDPOINTS[@]}))
SUCCESS=${#PASSED_ENDPOINTS[@]}
FAILED=${#FAILED_ENDPOINTS[@]}

echo -e "Total de endpoints probados: ${TOTAL}"
echo -e "${GREEN}Exitosos: ${SUCCESS}${NC}"
echo -e "${RED}Fallidos: ${FAILED}${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}========================================="
    echo "ENDPOINTS FALLIDOS"
    echo "=========================================${NC}"
    for item in "${FAILED_ENDPOINTS[@]}"; do
        IFS='|' read -r desc endpoint code <<< "$item"
        echo -e "${RED}❌${NC} $desc"
        echo -e "   Endpoint: ${YELLOW}$endpoint${NC}"
        echo -e "   HTTP Code: ${YELLOW}$code${NC}"
        echo ""
    done
fi

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
