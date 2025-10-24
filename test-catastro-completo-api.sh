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
echo "AUDITORÍA COMPLETA MÓDULO CATASTRO"
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
        echo "$BODY" > /tmp/last_catastro_response.json
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
echo "2. PROBANDO ENDPOINTS DE CATASTRO"
echo "========================================="
echo ""

# PROPERTIES
echo "--- Propiedades (Properties) ---"
test_endpoint "GET" "/catastro/properties/stats" "GET /catastro/properties/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/catastro/properties" "GET /catastro/properties"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/catastro/properties?page=1&limit=10" "GET /catastro/properties (paginado)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/catastro/properties/search/location?latitude=-10.5&longitude=-66.9&radius=5" "GET /catastro/properties/search/location"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# Obtener ID de una propiedad para pruebas
PROPERTY_ID=$(curl -s -X GET "${API_URL}/catastro/properties?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PROPERTY_ID" ]; then
    echo -e "${BLUE}Propiedad de prueba ID: $PROPERTY_ID${NC}"
    
    test_endpoint "GET" "/catastro/properties/${PROPERTY_ID}" "GET /catastro/properties/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    # Obtener código catastral
    CADASTRAL_CODE=$(curl -s -X GET "${API_URL}/catastro/properties/${PROPERTY_ID}" \
      -H "Authorization: Bearer ${TOKEN}" | grep -o '"cadastralCode":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ ! -z "$CADASTRAL_CODE" ]; then
        echo -e "${BLUE}Código catastral: $CADASTRAL_CODE${NC}"
        test_endpoint "GET" "/catastro/properties/cadastral/${CADASTRAL_CODE}" "GET /catastro/properties/cadastral/:code"
        ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    fi
    
    echo ""
    echo "--- Propietarios (Property Owners) ---"
    test_endpoint "GET" "/catastro/properties/${PROPERTY_ID}/owners" "GET /catastro/properties/:id/owners"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/catastro/properties/${PROPERTY_ID}/owners/current" "GET /catastro/properties/:id/owners/current"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    echo ""
fi

# URBAN VARIABLES
echo "--- Variables Urbanas (Urban Variables) ---"
test_endpoint "GET" "/catastro/urban-variables/stats" "GET /catastro/urban-variables/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/catastro/urban-variables" "GET /catastro/urban-variables"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

# Obtener ID de variable urbana
URBAN_VAR_ID=$(curl -s -X GET "${API_URL}/catastro/urban-variables?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$URBAN_VAR_ID" ]; then
    echo -e "${BLUE}Variable urbana de prueba ID: $URBAN_VAR_ID${NC}"
    
    test_endpoint "GET" "/catastro/urban-variables/${URBAN_VAR_ID}" "GET /catastro/urban-variables/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    # Obtener código de zona
    ZONE_CODE=$(curl -s -X GET "${API_URL}/catastro/urban-variables/${URBAN_VAR_ID}" \
      -H "Authorization: Bearer ${TOKEN}" | grep -o '"zoneCode":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ ! -z "$ZONE_CODE" ]; then
        echo -e "${BLUE}Código de zona: $ZONE_CODE${NC}"
        test_endpoint "GET" "/catastro/urban-variables/zone/${ZONE_CODE}" "GET /catastro/urban-variables/zone/:code"
        ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    fi
fi
echo ""

# CONSTRUCTION PERMITS
echo "--- Permisos de Construcción (Construction Permits) ---"
test_endpoint "GET" "/catastro/construction-permits/stats" "GET /catastro/construction-permits/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/catastro/construction-permits" "GET /catastro/construction-permits"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/catastro/construction-permits?status=PENDING" "GET /catastro/construction-permits (filtro)"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

# Obtener ID de permiso
PERMIT_ID=$(curl -s -X GET "${API_URL}/catastro/construction-permits?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PERMIT_ID" ]; then
    echo -e "${BLUE}Permiso de prueba ID: $PERMIT_ID${NC}"
    
    test_endpoint "GET" "/catastro/construction-permits/${PERMIT_ID}" "GET /catastro/construction-permits/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    # Obtener número de permiso
    PERMIT_NUMBER=$(curl -s -X GET "${API_URL}/catastro/construction-permits/${PERMIT_ID}" \
      -H "Authorization: Bearer ${TOKEN}" | grep -o '"permitNumber":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ ! -z "$PERMIT_NUMBER" ]; then
        echo -e "${BLUE}Número de permiso: $PERMIT_NUMBER${NC}"
        test_endpoint "GET" "/catastro/construction-permits/number/${PERMIT_NUMBER}" "GET /catastro/construction-permits/number/:number"
        ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    fi
    
    echo ""
    echo "--- Inspecciones de Permisos ---"
    test_endpoint "GET" "/catastro/construction-permits/${PERMIT_ID}/inspections" "GET /catastro/construction-permits/:id/inspections"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# URBAN INSPECTIONS
echo "--- Inspecciones Urbanas (Urban Inspections) ---"
test_endpoint "GET" "/catastro/urban-inspections/stats" "GET /catastro/urban-inspections/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/catastro/urban-inspections" "GET /catastro/urban-inspections"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

# Obtener ID de inspección urbana
INSPECTION_ID=$(curl -s -X GET "${API_URL}/catastro/urban-inspections?limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$INSPECTION_ID" ]; then
    echo -e "${BLUE}Inspección urbana de prueba ID: $INSPECTION_ID${NC}"
    
    test_endpoint "GET" "/catastro/urban-inspections/${INSPECTION_ID}" "GET /catastro/urban-inspections/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi

if [ ! -z "$PROPERTY_ID" ]; then
    test_endpoint "GET" "/catastro/urban-inspections/property/${PROPERTY_ID}" "GET /catastro/urban-inspections/property/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# Resumen
echo "========================================="
echo "RESUMEN DE AUDITORÍA CATASTRO"
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
echo "Basado en catastro.service.js:"
echo ""
echo "PROPIEDADES:"
echo "1. GET /catastro/properties/stats"
echo "2. GET /catastro/properties"
echo "3. GET /catastro/properties/:id"
echo "4. GET /catastro/properties/cadastral/:code"
echo "5. GET /catastro/properties/search/location"
echo "6. POST /catastro/properties"
echo "7. PUT /catastro/properties/:id"
echo "8. DELETE /catastro/properties/:id"
echo ""
echo "PROPIETARIOS:"
echo "9. GET /catastro/properties/:id/owners"
echo "10. GET /catastro/properties/:id/owners/current"
echo "11. POST /catastro/properties/:id/owners"
echo "12. GET /catastro/property-owners/taxpayer/:id"
echo ""
echo "VARIABLES URBANAS:"
echo "13. GET /catastro/urban-variables"
echo "14. GET /catastro/urban-variables/:id"
echo "15. GET /catastro/urban-variables/zone/:code"
echo "16. POST /catastro/urban-variables/zone/:code/check-compliance"
echo "17. GET /catastro/urban-variables/stats"
echo ""
echo "PERMISOS DE CONSTRUCCIÓN:"
echo "18. GET /catastro/construction-permits"
echo "19. GET /catastro/construction-permits/:id"
echo "20. GET /catastro/construction-permits/number/:number"
echo "21. GET /catastro/construction-permits/stats"
echo "22. POST /catastro/construction-permits/:id/review"
echo "23. POST /catastro/construction-permits/:id/approve-reject"
echo "24. POST /catastro/construction-permits/:id/payment"
echo "25. POST /catastro/construction-permits/:id/start"
echo "26. POST /catastro/construction-permits/:id/complete"
echo "27. POST /catastro/construction-permits/:id/cancel"
echo ""
echo "INSPECCIONES:"
echo "28. GET /catastro/construction-permits/:id/inspections"
echo "29. GET /catastro/urban-inspections"
echo "30. GET /catastro/urban-inspections/:id"
echo "31. GET /catastro/urban-inspections/property/:id"
echo "32. GET /catastro/urban-inspections/stats"
echo "33. POST /catastro/urban-inspections/:id/notification"
echo "34. POST /catastro/urban-inspections/:id/sanction"
echo "35. POST /catastro/urban-inspections/:id/resolve"
echo ""
