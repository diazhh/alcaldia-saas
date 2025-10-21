# Sistema Municipal - Frontend

Frontend del Sistema Integral de Gestión Municipal desarrollado con Next.js 14+ y React 18+.

## 🚀 Stack Tecnológico

- **Next.js 14+** (App Router)
- **React 18+**
- **TailwindCSS** para estilos
- **shadcn/ui** para componentes UI
- **Zustand** para estado global
- **React Query** para data fetching
- **Axios** para peticiones HTTP
- **React Hook Form + Zod** para formularios

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Iniciar en desarrollo
npm run dev
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard
│   ├── layout.js          # Layout principal
│   └── globals.css        # Estilos globales
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── shared/            # Componentes compartidos
│   └── modules/           # Componentes por módulo
├── lib/
│   ├── api.js             # Configuración de Axios
│   ├── queryClient.js     # Configuración React Query
│   └── utils.js           # Utilidades
├── hooks/                 # Custom hooks
├── store/                 # Zustand stores
└── constants/             # Constantes de la app
```

## 🎨 Paleta de Colores

- **Primary**: Blue (#3b82f6)
- **Secondary**: Slate (#64748b)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Iniciar en producción
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de ESLint
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
```

## 🔐 Autenticación

El sistema utiliza JWT almacenado en localStorage. El token se adjunta automáticamente a todas las peticiones mediante un interceptor de Axios.

## 📚 Documentación

- [Next.js](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)

## 🤝 Contribución

1. Seguir conventional commits
2. Mantener coverage de tests > 70%
3. Código debe pasar ESLint y Prettier
4. Documentar componentes complejos con JSDoc
