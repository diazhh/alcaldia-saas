#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empleado16@municipal.gob.ve","password":"password123"}' | jq -r '.data.token')

echo "🔍 Permisos del EMPLEADO:"
echo ""
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/permissions/me | jq '.'
