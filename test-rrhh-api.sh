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
echo "AUDITORÍA MÓDULO RRHH"
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
echo "2. PROBANDO ENDPOINTS DE RRHH"
echo "========================================="
echo ""

# ============================================
# EMPLEADOS
# ============================================
echo "--- Empleados ---"
test_endpoint "GET" "/hr/employees" "GET /hr/employees"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/employees/stats/general" "GET /hr/employees/stats/general"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

# Obtener ID de un empleado para pruebas
EMPLOYEE_ID=$(curl -s -X GET "${API_URL}/hr/employees" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/employees/${EMPLOYEE_ID}" "GET /hr/employees/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/employees/${EMPLOYEE_ID}/profile" "GET /hr/employees/:id/profile"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/employees/${EMPLOYEE_ID}/full" "GET /hr/employees/:id/full"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# POSICIONES/CARGOS
# ============================================
echo "--- Posiciones/Cargos ---"
test_endpoint "GET" "/hr/positions" "GET /hr/positions"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

POSITION_ID=$(curl -s -X GET "${API_URL}/hr/positions" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$POSITION_ID" ]; then
    test_endpoint "GET" "/hr/positions/${POSITION_ID}" "GET /hr/positions/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# ASISTENCIA
# ============================================
echo "--- Asistencia ---"
test_endpoint "GET" "/hr/attendance" "GET /hr/attendance"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/attendance/stats" "GET /hr/attendance/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/attendance/report" "GET /hr/attendance/report"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/attendance/employee/${EMPLOYEE_ID}" "GET /hr/attendance/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/attendance/stats/${EMPLOYEE_ID}" "GET /hr/attendance/stats/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# VACACIONES
# ============================================
echo "--- Vacaciones ---"
test_endpoint "GET" "/hr/vacations" "GET /hr/vacations"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/vacations/employee/${EMPLOYEE_ID}" "GET /hr/vacations/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/vacations/balance/${EMPLOYEE_ID}" "GET /hr/vacations/balance/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# PERMISOS Y LICENCIAS
# ============================================
echo "--- Permisos y Licencias ---"
test_endpoint "GET" "/hr/leaves" "GET /hr/leaves"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/leaves/employee/${EMPLOYEE_ID}" "GET /hr/leaves/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# NÓMINA
# ============================================
echo "--- Nómina ---"
test_endpoint "GET" "/hr/payrolls" "GET /hr/payrolls"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

PAYROLL_ID=$(curl -s -X GET "${API_URL}/hr/payrolls" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$PAYROLL_ID" ]; then
    test_endpoint "GET" "/hr/payrolls/${PAYROLL_ID}" "GET /hr/payrolls/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi

test_endpoint "GET" "/hr/payroll-concepts" "GET /hr/payroll-concepts"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# ============================================
# DOCUMENTOS
# ============================================
echo "--- Documentos ---"
if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/documents/employee/${EMPLOYEE_ID}" "GET /hr/documents/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# EVALUACIONES
# ============================================
echo "--- Evaluaciones de Desempeño ---"
test_endpoint "GET" "/hr/evaluations" "GET /hr/evaluations"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/evaluations/employee/${EMPLOYEE_ID}" "GET /hr/evaluations/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# CAPACITACIONES
# ============================================
echo "--- Capacitaciones ---"
test_endpoint "GET" "/hr/trainings" "GET /hr/trainings"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

TRAINING_ID=$(curl -s -X GET "${API_URL}/hr/trainings" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$TRAINING_ID" ]; then
    test_endpoint "GET" "/hr/trainings/${TRAINING_ID}" "GET /hr/trainings/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/trainings/employee/${EMPLOYEE_ID}" "GET /hr/trainings/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# PRESTACIONES SOCIALES
# ============================================
echo "--- Prestaciones Sociales ---"
if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/severance/employee/${EMPLOYEE_ID}" "GET /hr/severance/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# PORTAL DEL EMPLEADO
# ============================================
echo "--- Portal del Empleado ---"
test_endpoint "GET" "/hr/portal/my-data" "GET /hr/portal/my-data"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
echo ""

# ============================================
# CAJA DE AHORRO
# ============================================
echo "--- Caja de Ahorro ---"
test_endpoint "GET" "/hr/savings-bank" "GET /hr/savings-bank"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/savings-bank/stats" "GET /hr/savings-bank/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/savings-bank/employee/${EMPLOYEE_ID}" "GET /hr/savings-bank/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/savings-bank/loans/employee/${EMPLOYEE_ID}" "GET /hr/savings-bank/loans/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# DEPENDIENTES
# ============================================
echo "--- Dependientes ---"
test_endpoint "GET" "/hr/dependents" "GET /hr/dependents"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/dependents/stats" "GET /hr/dependents/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

DEPENDENT_ID=$(curl -s -X GET "${API_URL}/hr/dependents" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$DEPENDENT_ID" ]; then
    test_endpoint "GET" "/hr/dependents/${DEPENDENT_ID}" "GET /hr/dependents/:id"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/dependents/employee/${EMPLOYEE_ID}" "GET /hr/dependents/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/dependents/employee/${EMPLOYEE_ID}/children" "GET /hr/dependents/employee/:employeeId/children"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/dependents/employee/${EMPLOYEE_ID}/child-bonus" "GET /hr/dependents/employee/:employeeId/child-bonus"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# ACCIONES DISCIPLINARIAS
# ============================================
echo "--- Acciones Disciplinarias ---"
test_endpoint "GET" "/hr/disciplinary" "GET /hr/disciplinary"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/disciplinary/stats" "GET /hr/disciplinary/stats"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

DISCIPLINARY_ID=$(curl -s -X GET "${API_URL}/hr/disciplinary" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$DISCIPLINARY_ID" ]; then
    test_endpoint "GET" "/hr/disciplinary/${DISCIPLINARY_ID}" "GET /hr/disciplinary/:actionId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/disciplinary/employee/${EMPLOYEE_ID}" "GET /hr/disciplinary/employee/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/disciplinary/employee/${EMPLOYEE_ID}/history" "GET /hr/disciplinary/employee/:employeeId/history"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
echo ""

# ============================================
# REPORTES
# ============================================
echo "--- Reportes ---"
test_endpoint "GET" "/hr/reports/birthdays" "GET /hr/reports/birthdays"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/reports/seniority" "GET /hr/reports/seniority"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/reports/turnover" "GET /hr/reports/turnover"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/reports/absenteeism" "GET /hr/reports/absenteeism"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/reports/payroll-cost" "GET /hr/reports/payroll-cost"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

test_endpoint "GET" "/hr/reports/retirement-projection" "GET /hr/reports/retirement-projection"
((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }

if [ ! -z "$EMPLOYEE_ID" ]; then
    test_endpoint "GET" "/hr/reports/work-certificate/${EMPLOYEE_ID}" "GET /hr/reports/work-certificate/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
    
    test_endpoint "GET" "/hr/reports/income-statement/${EMPLOYEE_ID}" "GET /hr/reports/income-statement/:employeeId"
    ((TOTAL++)); [ $? -eq 0 ] && ((SUCCESS++)) || { [ $? -eq 2 ] && ((NOT_IMPL++)) || ((FAILED++)); }
fi
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
