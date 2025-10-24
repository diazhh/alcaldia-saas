#!/bin/bash

echo "🧪 Probando login de todos los usuarios de desarrollo..."
echo ""

users=(
  "superadmin@municipal.gob.ve:admin123:SUPER_ADMIN"
  "admin@municipal.gob.ve:admin123:ADMIN"
  "director@municipal.gob.ve:password123:DIRECTOR"
  "coordinador19@municipal.gob.ve:password123:COORDINADOR"
  "empleado16@municipal.gob.ve:password123:EMPLEADO"
  "ciudadano@example.com:password123:CIUDADANO"
)

for user_data in "${users[@]}"; do
  IFS=':' read -r email password role <<< "$user_data"

  echo "🔐 Probando $role ($email)..."

  RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")

  SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

  if [ "$SUCCESS" == "true" ]; then
    echo "   ✅ Login exitoso"
  else
    MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
    echo "   ❌ Login falló: $MESSAGE"
  fi
  echo ""
done

echo "✅ Pruebas completadas!"
