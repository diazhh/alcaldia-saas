#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:3001/api"

# Autenticar
echo "Autenticando..."
TOKEN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@municipal.gob.ve\",\"password\":\"Admin123!\"}" | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error en autenticación${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtenido${NC}\n"

# Función de prueba
test() {
    local url=$1
    local desc=$2
    echo -n "$desc... "
    local code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_URL}${url}" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if [ "$code" = "200" ]; then
        echo -e "${GREEN}✅ $code${NC}"
        return 0
    else
        echo -e "${RED}❌ $code${NC}"
        return 1
    fi
}

echo "=== CATASTRO ENDPOINTS ==="
test "/catastro/properties" "Propiedades"
test "/catastro/properties/stats" "Stats Propiedades"
test "/catastro/urban-variables" "Variables Urbanas"
test "/catastro/urban-variables/stats" "Stats Variables"
test "/catastro/construction-permits" "Permisos"
test "/catastro/construction-permits/stats" "Stats Permisos"
test "/catastro/urban-inspections" "Inspecciones"
test "/catastro/urban-inspections/stats" "Stats Inspecciones"

echo -e "\n=== DETALLE DE RESPUESTA ==="
echo "Propiedades (primeras 300 chars):"
curl -s -X GET "${API_URL}/catastro/properties?limit=2" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 300
echo -e "\n"
