#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    Configuración del Sistema Municipal       ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Verificar si Docker está instalado
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker no está instalado.${NC}" >&2
  echo -e "${YELLOW}Por favor, instale Docker antes de continuar.${NC}"
  exit 1
fi

# Verificar si Docker Compose está instalado
if ! [ -x "$(command -v docker-compose)" ]; then
  echo -e "${RED}Error: Docker Compose no está instalado.${NC}" >&2
  echo -e "${YELLOW}Por favor, instale Docker Compose antes de continuar.${NC}"
  exit 1
fi

# Verificar si npm está instalado
if ! [ -x "$(command -v npm)" ]; then
  echo -e "${RED}Error: npm no está instalado.${NC}" >&2
  echo -e "${YELLOW}Por favor, instale Node.js y npm antes de continuar.${NC}"
  exit 1
fi

# Verificar si PM2 está instalado globalmente
if ! [ -x "$(command -v pm2)" ]; then
  echo -e "${YELLOW}PM2 no está instalado. Instalando...${NC}"
  npm install -g pm2
else
  echo -e "${GREEN}PM2 ya está instalado.${NC}"
fi

# Función para instalar dependencias
install_dependencies() {
  echo -e "${BLUE}Instalando dependencias del backend...${NC}"
  cd backend && npm install
  
  echo -e "${BLUE}Instalando dependencias del frontend...${NC}"
  cd ../frontend && npm install
  
  cd ..
}

# Función para iniciar entorno de desarrollo
start_dev() {
  echo -e "${BLUE}Iniciando entorno de desarrollo...${NC}"
  
  # Iniciar PostgreSQL con Docker
  echo -e "${YELLOW}Iniciando PostgreSQL en puerto 5433...${NC}"
  docker-compose -f docker-compose.dev.yml up -d
  
  # Esperar a que PostgreSQL esté listo
  echo -e "${YELLOW}Esperando a que PostgreSQL esté listo...${NC}"
  sleep 10
  
  # Ejecutar migraciones de Prisma
  echo -e "${BLUE}Ejecutando migraciones de base de datos...${NC}"
  cd backend && npx prisma migrate deploy
  
  # Opcional: Seed de datos iniciales
  echo -e "${BLUE}Ejecutando seed de datos iniciales...${NC}"
  npx prisma db seed
  
  echo -e "${GREEN}Entorno de desarrollo configurado correctamente.${NC}"
  echo -e "${YELLOW}Para iniciar el backend: cd backend && npm run dev${NC}"
  echo -e "${YELLOW}Para iniciar el frontend: cd frontend && npm run dev${NC}"
}

# Función para iniciar entorno de producción con PM2
start_prod() {
  echo -e "${BLUE}Iniciando entorno de producción...${NC}"
  
  # Iniciar PostgreSQL con Docker
  echo -e "${YELLOW}Iniciando PostgreSQL en puerto 5433...${NC}"
  docker-compose -f docker-compose.prod.yml up -d postgres
  
  # Esperar a que PostgreSQL esté listo
  echo -e "${YELLOW}Esperando a que PostgreSQL esté listo...${NC}"
  sleep 10
  
  # Ejecutar migraciones de Prisma
  echo -e "${BLUE}Ejecutando migraciones de base de datos...${NC}"
  cd backend && npx prisma migrate deploy
  
  # Construir el frontend
  echo -e "${BLUE}Construyendo el frontend...${NC}"
  cd ../frontend && npm run build
  
  # Iniciar con PM2
  echo -e "${BLUE}Iniciando aplicación con PM2...${NC}"
  cd ..
  pm2 start ecosystem.config.js
  
  echo -e "${GREEN}Entorno de producción configurado correctamente.${NC}"
  echo -e "${YELLOW}La aplicación está corriendo con PM2. Para ver el estado: pm2 status${NC}"
  echo -e "${GREEN}Frontend en producción: http://localhost:4000${NC}"
  echo -e "${GREEN}Backend en producción: http://localhost:4001${NC}"
}

# Menú principal
echo -e "${BLUE}Seleccione una opción:${NC}"
echo -e "${YELLOW}1. Instalar dependencias${NC}"
echo -e "${YELLOW}2. Iniciar entorno de desarrollo${NC}"
echo -e "${YELLOW}3. Iniciar entorno de producción con PM2${NC}"
echo -e "${YELLOW}4. Salir${NC}"

read -p "Opción: " option

case $option in
  1)
    install_dependencies
    ;;
  2)
    start_dev
    ;;
  3)
    start_prod
    ;;
  4)
    echo -e "${GREEN}Saliendo...${NC}"
    exit 0
    ;;
  *)
    echo -e "${RED}Opción inválida${NC}"
    exit 1
    ;;
esac
