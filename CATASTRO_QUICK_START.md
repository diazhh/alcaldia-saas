# 🚀 Catastro Module - Quick Start Guide

## 🎯 Acceso Rápido

### URLs del Módulo
```
http://localhost:3000/catastro                    # Dashboard
http://localhost:3000/catastro/propiedades        # Propiedades
http://localhost:3000/catastro/mapa               # Mapa SIG
http://localhost:3000/catastro/variables-urbanas  # Variables Urbanas
http://localhost:3000/catastro/permisos           # Permisos
http://localhost:3000/catastro/consulta-publica   # Consulta Pública
http://localhost:3000/catastro/control-urbano     # Control Urbano
```

### API Base URL
```
http://localhost:5000/api/catastro
```

---

## 🏃 Inicio Rápido

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```

### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
```

### 3. Acceder al Sistema
- URL: http://localhost:3000
- Login con cualquier usuario de prueba (ver abajo)

---

## 👥 Usuarios de Prueba

```javascript
// Usuarios disponibles
{
  email: "superadmin@municipal.gob.ve",
  password: "Admin123!",
  rol: "SUPER_ADMIN"
}

{
  email: "admin@municipal.gob.ve",
  password: "Admin123!",
  rol: "ADMIN"
}
```

---

## 📋 Flujos Principales

### Registrar una Propiedad
1. Ir a `/catastro/propiedades`
2. Click en "Nueva Propiedad"
3. Llenar formulario (tabs: Básico, Detalles, Linderos, Servicios)
4. Guardar

### Crear Variable Urbana
1. Ir a `/catastro/variables-urbanas`
2. Click en "Nueva Variable Urbana"
3. Definir código de zona y normativas
4. Guardar

### Solicitar Permiso de Construcción
1. Ir a `/catastro/permisos`
2. Click en "Nueva Solicitud"
3. Llenar datos del solicitante y proyecto
4. Guardar

### Ver Mapa SIG
1. Ir a `/catastro/mapa`
2. Activar/desactivar capas desde el panel
3. Click en marcadores para ver detalles

---

## 🧪 Ejecutar Tests

### Backend
```bash
cd backend
npm test tests/unit/catastro
npm test tests/integration/catastro.integration.test.js
```

### Frontend
```bash
cd frontend
npm test tests/components/catastro
npm test tests/integration/catastro.integration.test.jsx
```

---

## 📡 API Endpoints Principales

### Propiedades
```bash
# Listar propiedades
GET /api/catastro/properties

# Crear propiedad
POST /api/catastro/properties
{
  "taxpayerId": "uuid",
  "cadastralCode": "01-02-03-004",
  "address": "Calle Principal",
  "propertyUse": "RESIDENTIAL",
  "latitude": 10.4806,
  "longitude": -66.9036,
  "landArea": 200,
  "constructionArea": 150
}

# Obtener por código catastral
GET /api/catastro/properties/cadastral/:code
```

### Variables Urbanas
```bash
# Listar variables
GET /api/catastro/urban-variables

# Crear variable
POST /api/catastro/urban-variables
{
  "zoneCode": "R1",
  "zoneName": "Zona Residencial 1",
  "zoneType": "RESIDENTIAL",
  "frontSetback": 5,
  "maxHeight": 12,
  "allowedUses": ["Vivienda unifamiliar"]
}

# Verificar cumplimiento
POST /api/catastro/urban-variables/zone/:code/check-compliance
{
  "frontSetback": 5,
  "rearSetback": 3,
  "height": 10,
  "use": "Vivienda unifamiliar"
}
```

### Permisos de Construcción
```bash
# Listar permisos
GET /api/catastro/construction-permits

# Crear permiso
POST /api/catastro/construction-permits
{
  "propertyId": "uuid",
  "applicantName": "Juan Pérez",
  "applicantPhone": "0414-1234567",
  "projectType": "NEW_CONSTRUCTION",
  "projectDescription": "Construcción de vivienda",
  "constructionArea": 150
}

# Revisar permiso
POST /api/catastro/construction-permits/:id/review
{
  "complies": true,
  "observations": "Cumple con normativas"
}

# Aprobar permiso
POST /api/catastro/construction-permits/:id/approve-reject
{
  "approved": true,
  "observations": "Aprobado"
}
```

---

## 🗺️ Uso del Mapa SIG

### Activar/Desactivar Capas
```javascript
// Panel de control en la esquina superior derecha
- ☑ Propiedades
- ☑ Zonificación
- ☐ Servicios Públicos
- ☐ Vialidad
```

### Herramientas
```javascript
// Panel de herramientas en la esquina superior izquierda
- Medir: Herramienta de medición
- Exportar: Descargar mapa como imagen
```

### Interacción
```javascript
// Click en marcadores → Ver detalles de propiedad
// Click en polígonos → Ver detalles de zona
// Zoom: Scroll del mouse o controles
// Pan: Arrastrar mapa
```

---

## 🎨 Componentes Reutilizables

### MapView
```jsx
import MapView from '@/components/modules/catastro/MapView';

<MapView
  properties={properties}
  zones={zones}
  center={[10.4806, -66.9036]}
  zoom={13}
  onPropertyClick={handlePropertyClick}
  onZoneClick={handleZoneClick}
  showMeasurementTools={true}
/>
```

### PropertyCadastralDialog
```jsx
import PropertyCadastralDialog from '@/components/modules/catastro/PropertyCadastralDialog';

<PropertyCadastralDialog
  open={dialogOpen}
  onClose={handleClose}
  property={selectedProperty} // null para crear nuevo
/>
```

### UrbanVariableDialog
```jsx
import UrbanVariableDialog from '@/components/modules/catastro/UrbanVariableDialog';

<UrbanVariableDialog
  open={dialogOpen}
  onClose={handleClose}
  urbanVariable={selectedVariable}
/>
```

---

## 🔧 Configuración

### Variables de Entorno

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/municipal_db"
JWT_SECRET="your-secret-key"
PORT=5000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📊 Datos de Ejemplo

### Crear Propiedad de Ejemplo
```javascript
{
  "taxpayerId": "existing-taxpayer-id",
  "cadastralCode": "01-02-03-004",
  "address": "Calle Principal, Sector Centro",
  "propertyUse": "RESIDENTIAL",
  "latitude": 10.4806,
  "longitude": -66.9036,
  "parish": "Catedral",
  "sector": "Centro",
  "landArea": 200,
  "constructionArea": 150,
  "floors": 2,
  "rooms": 4,
  "bathrooms": 2,
  "constructionYear": 2020,
  "conservationState": "GOOD",
  "hasWater": true,
  "hasElectricity": true,
  "hasSewerage": true,
  "hasGas": false,
  "cadastralValue": 50000
}
```

### Crear Variable Urbana de Ejemplo
```javascript
{
  "zoneCode": "R1",
  "zoneName": "Zona Residencial 1",
  "zoneType": "RESIDENTIAL",
  "frontSetback": 5,
  "rearSetback": 3,
  "leftSetback": 2,
  "rightSetback": 2,
  "maxHeight": 12,
  "maxDensity": 200,
  "maxConstructionPercentage": 70,
  "minLotArea": 150,
  "allowedUses": [
    "Vivienda unifamiliar",
    "Vivienda multifamiliar",
    "Comercio menor"
  ],
  "parkingSpaces": 2
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'leaflet'"
```bash
cd frontend
npm install leaflet react-leaflet --legacy-peer-deps
```

### Error: "Checkbox component not found"
```bash
cd frontend
npm install @radix-ui/react-checkbox --legacy-peer-deps
```

### Mapa no carga
- Verificar que el componente se importa dinámicamente
- Usar `dynamic import` con `ssr: false`

### Tests fallan
```bash
# Limpiar cache de Jest
npm test -- --clearCache

# Ejecutar tests específicos
npm test tests/components/catastro/MapView.test.jsx
```

---

## 📚 Recursos Adicionales

### Documentación
- `FASE-5-CATASTRO-COMPLETADO.md` - Documentación completa
- `CATASTRO_IMPLEMENTATION_SUMMARY.md` - Resumen de implementación
- `backend/tests/CATASTRO_TESTS_SUMMARY.md` - Resumen de tests

### Código de Referencia
- Backend: `/backend/src/modules/catastro/`
- Frontend: `/frontend/src/app/(dashboard)/catastro/`
- Tests: `/backend/tests/unit/catastro/` y `/frontend/tests/components/catastro/`

---

## 💡 Tips

1. **Usa el mapa SIG** para visualizar propiedades georreferenciadas
2. **Verifica normativas** antes de aprobar permisos
3. **Consulta el portal público** sin autenticación
4. **Exporta mapas** para reportes
5. **Usa búsqueda avanzada** para encontrar propiedades rápidamente

---

## 🎯 Próximos Pasos

1. Explorar el dashboard principal
2. Registrar propiedades de prueba
3. Crear variables urbanas
4. Solicitar permisos de construcción
5. Visualizar en el mapa SIG

---

**¡Listo para usar!** 🚀

Para más información, consulta la documentación completa en `FASE-5-CATASTRO-COMPLETADO.md`
