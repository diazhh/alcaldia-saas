#!/bin/bash

# ============================================
# Script de Pruebas - Módulo CATASTRO
# ============================================
# Prueba todos los endpoints GET del módulo de catastro
# Basado en el script exitoso de finanzas

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://147.93.184.19:3001/api"
EMAIL="admin@municipal.gob.ve"
PASSWORD="Admin123\u0021"

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Arrays para almacenar resultados
declare -a PASSED_ENDPOINTS
declare -a FAILED_ENDPOINTS

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  AUDITORÍA MÓDULO CATASTRO${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Servidor:${NC} $API_URL"
echo -e "${YELLOW}Usuario:${NC} $EMAIL"
echo ""

# ============================================
# PASO 1: AUTENTICACIÓN
# ============================================
echo -e "${BLUE}[1/8] Autenticando...${NC}"

AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $AUTH_RESPONSE | jq -r '.data.token // .token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}❌ Error de autenticación${NC}"
  echo "Respuesta: $AUTH_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Autenticación exitosa${NC}"
echo ""

# ============================================
# FUNCIÓN PARA PROBAR ENDPOINTS
# ============================================
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  # Realizar petición
  RESPONSE=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  # Separar body y status code
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  # Verificar resultado
  if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ [$HTTP_CODE]${NC} $description"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    PASSED_ENDPOINTS+=("$endpoint")
  else
    echo -e "${RED}❌ [$HTTP_CODE]${NC} $description"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_ENDPOINTS+=("$endpoint")
    
    # Mostrar error si existe
    ERROR_MSG=$(echo "$BODY" | jq -r '.message // .error // empty' 2>/dev/null)
    if [ ! -z "$ERROR_MSG" ]; then
      echo -e "${RED}   Error: $ERROR_MSG${NC}"
    fi
  fi
}

# ============================================
# PASO 2: PROPIEDADES (PROPERTIES)
# ============================================
echo -e "${BLUE}[2/8] Probando endpoints de PROPIEDADES...${NC}"

test_endpoint "GET" "/catastro/properties" "GET /catastro/properties - Listar propiedades"
test_endpoint "GET" "/catastro/properties/stats" "GET /catastro/properties/stats - Estadísticas"
test_endpoint "GET" "/catastro/properties/search/location?latitude=10.0&longitude=-66.0&radius=5" "GET /catastro/properties/search/location - Buscar por ubicación"

echo ""

# ============================================
# PASO 3: VARIABLES URBANAS
# ============================================
echo -e "${BLUE}[3/8] Probando endpoints de VARIABLES URBANAS...${NC}"

test_endpoint "GET" "/catastro/urban-variables" "GET /catastro/urban-variables - Listar variables"
test_endpoint "GET" "/catastro/urban-variables/stats" "GET /catastro/urban-variables/stats - Estadísticas"

echo ""

# ============================================
# PASO 4: PERMISOS DE CONSTRUCCIÓN
# ============================================
echo -e "${BLUE}[4/8] Probando endpoints de PERMISOS DE CONSTRUCCIÓN...${NC}"

test_endpoint "GET" "/catastro/construction-permits" "GET /catastro/construction-permits - Listar permisos"
test_endpoint "GET" "/catastro/construction-permits/stats" "GET /catastro/construction-permits/stats - Estadísticas"

echo ""

# ============================================
# PASO 5: INSPECCIONES URBANAS
# ============================================
echo -e "${BLUE}[5/8] Probando endpoints de INSPECCIONES URBANAS...${NC}"

test_endpoint "GET" "/catastro/urban-inspections" "GET /catastro/urban-inspections - Listar inspecciones"
test_endpoint "GET" "/catastro/urban-inspections/stats" "GET /catastro/urban-inspections/stats - Estadísticas"

echo ""

# ============================================
# PASO 6: CAPAS SIG (ZONE LAYERS)
# ============================================
echo -e "${BLUE}[6/8] Probando endpoints de CAPAS SIG...${NC}"

test_endpoint "GET" "/catastro/zone-layers" "GET /catastro/zone-layers - Listar capas"
test_endpoint "GET" "/catastro/zone-layers/stats" "GET /catastro/zone-layers/stats - Estadísticas"
test_endpoint "GET" "/catastro/zone-layers/visible" "GET /catastro/zone-layers/visible - Capas visibles"

echo ""

# ============================================
# PASO 7: PRUEBAS CON DATOS ESPECÍFICOS
# ============================================
echo -e "${BLUE}[7/8] Probando endpoints con datos específicos...${NC}"

# Obtener primera propiedad si existe
PROPERTIES_RESPONSE=$(curl -s -X GET "$API_URL/catastro/properties?limit=1" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

PROPERTY_ID=$(echo "$PROPERTIES_RESPONSE" | jq -r '.data.properties[0].id // .data[0].id // empty' 2>/dev/null)

if [ ! -z "$PROPERTY_ID" ] && [ "$PROPERTY_ID" != "null" ]; then
  echo -e "${YELLOW}   Usando Property ID: $PROPERTY_ID${NC}"
  test_endpoint "GET" "/catastro/properties/$PROPERTY_ID" "GET /catastro/properties/:id - Obtener propiedad"
  test_endpoint "GET" "/catastro/properties/$PROPERTY_ID/owners" "GET /catastro/properties/:id/owners - Propietarios"
else
  echo -e "${YELLOW}   ⚠️  No hay propiedades para probar endpoints específicos${NC}"
  TOTAL_TESTS=$((TOTAL_TESTS + 2))
  FAILED_TESTS=$((FAILED_TESTS + 2))
  FAILED_ENDPOINTS+=("/catastro/properties/:id")
  FAILED_ENDPOINTS+=("/catastro/properties/:id/owners")
fi

# Obtener primer permiso si existe
PERMITS_RESPONSE=$(curl -s -X GET "$API_URL/catastro/construction-permits?limit=1" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

PERMIT_ID=$(echo "$PERMITS_RESPONSE" | jq -r '.data.permits[0].id // .data[0].id // empty' 2>/dev/null)

if [ ! -z "$PERMIT_ID" ] && [ "$PERMIT_ID" != "null" ]; then
  echo -e "${YELLOW}   Usando Permit ID: $PERMIT_ID${NC}"
  test_endpoint "GET" "/catastro/construction-permits/$PERMIT_ID" "GET /catastro/construction-permits/:id - Obtener permiso"
  test_endpoint "GET" "/catastro/construction-permits/$PERMIT_ID/inspections" "GET /catastro/construction-permits/:id/inspections - Inspecciones"
else
  echo -e "${YELLOW}   ⚠️  No hay permisos para probar endpoints específicos${NC}"
  TOTAL_TESTS=$((TOTAL_TESTS + 2))
  FAILED_TESTS=$((FAILED_TESTS + 2))
  FAILED_ENDPOINTS+=("/catastro/construction-permits/:id")
  FAILED_ENDPOINTS+=("/catastro/construction-permits/:id/inspections")
fi

echo ""

# ============================================
# PASO 8: RESUMEN DE RESULTADOS
# ============================================
echo -e "${BLUE}[8/8] Generando resumen...${NC}"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  RESUMEN DE PRUEBAS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Total de pruebas:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Pruebas exitosas:${NC} $PASSED_TESTS"
echo -e "${RED}Pruebas fallidas:${NC} $FAILED_TESTS"
echo ""

# Calcular porcentaje
if [ $TOTAL_TESTS -gt 0 ]; then
  PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
  echo -e "${YELLOW}Porcentaje de éxito:${NC} ${PERCENTAGE}%"
  echo ""
fi

# Mostrar endpoints fallidos si existen
if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${RED}Endpoints con errores:${NC}"
  for endpoint in "${FAILED_ENDPOINTS[@]}"; do
    echo -e "${RED}  ❌ $endpoint${NC}"
  done
  echo ""
fi

# Mostrar endpoints exitosos
if [ $PASSED_TESTS -gt 0 ]; then
  echo -e "${GREEN}Endpoints funcionando:${NC}"
  for endpoint in "${PASSED_ENDPOINTS[@]}"; do
    echo -e "${GREEN}  ✅ $endpoint${NC}"
  done
  echo ""
fi

# Estado final
echo -e "${BLUE}============================================${NC}"
if [ $PERCENTAGE -eq 100 ]; then
  echo -e "${GREEN}✅ TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE${NC}"
  exit 0
elif [ $PERCENTAGE -ge 80 ]; then
  echo -e "${YELLOW}⚠️  LA MAYORÍA DE ENDPOINTS FUNCIONAN${NC}"
  exit 0
else
  echo -e "${RED}❌ MÚLTIPLES ENDPOINTS CON ERRORES${NC}"
  exit 1
fi
