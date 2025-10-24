#!/bin/bash

echo "🔐 Haciendo login..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@municipal.gob.ve","password":"admin123"}')

echo "$RESPONSE" | jq '.'

TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo ""
  echo "✅ Login exitoso! Token obtenido"
  echo ""
  echo "📋 Probando endpoint de permisos..."
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/permissions/me | jq '.'
else
  echo "❌ Login falló"
fi
