# Tests del Frontend - Módulo de RRHH

Este directorio contiene todos los tests del frontend del Sistema Integral de Gestión Municipal.

## Estructura

```
tests/
├── components/
│   └── hr/
│       ├── EmployeeTable.test.jsx      # Tests de tabla de empleados
│       └── EmployeeForm.test.jsx       # Tests de formulario de empleados
├── hooks/
│   └── hr/
│       └── useEmployees.test.js        # Tests de custom hooks
├── integration/
│   └── hr/
│       └── employee-flow.test.jsx      # Tests de flujo completo
├── README.md                            # Este archivo
└── setup.js                             # Configuración de tests
```

## Tests Implementados

### Tests de Componentes

#### EmployeeTable.test.jsx
- ✅ Renderizado de tabla con empleados
- ✅ Visualización de estados (activo/inactivo)
- ✅ Skeleton loading
- ✅ Mensaje cuando no hay datos
- ✅ Información de paginación
- ✅ Navegación entre páginas
- ✅ Botones deshabilitados correctamente
- ✅ Visualización de cargo y departamento

**Total: 8 tests**

#### EmployeeForm.test.jsx
- ✅ Renderizado de formulario con tabs
- ✅ Campos requeridos visibles
- ✅ Validación de campos requeridos
- ✅ Llenado y envío de formulario
- ✅ Botón deshabilitado al enviar
- ✅ Carga de datos iniciales
- ✅ Botón cancelar presente
- ✅ Navegación entre tabs

**Total: 8 tests**

### Tests de Hooks

#### useEmployees.test.js
- ✅ Obtener lista de empleados
- ✅ Aplicar filtros correctamente
- ✅ Obtener empleado por ID
- ✅ No hacer petición sin ID
- ✅ Crear empleado exitosamente
- ✅ Manejo de errores al crear

**Total: 6 tests**

### Tests de Integración

#### employee-flow.test.jsx
- ✅ Mostrar lista de empleados
- ✅ Buscar empleados
- ✅ Filtrar por estado
- ✅ Mostrar formulario de nuevo empleado
- ✅ Validar campos requeridos
- ✅ Mostrar estadísticas correctas

**Total: 6 tests**

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests en modo watch
```bash
npm run test:watch
```

### Tests con cobertura
```bash
npm test -- --coverage
```

### Tests específicos
```bash
# Solo tests de componentes
npm test -- tests/components

# Solo tests de hooks
npm test -- tests/hooks

# Solo tests de integración
npm test -- tests/integration

# Un archivo específico
npm test -- tests/components/hr/EmployeeTable.test.jsx
```

## Cobertura de Tests

### Objetivo
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### Archivos Cubiertos
- ✅ `components/modules/hr/EmployeeTable.jsx`
- ✅ `components/modules/hr/EmployeeForm.jsx`
- ✅ `hooks/hr/useEmployees.js`
- ✅ Flujo completo de gestión de empleados

## Configuración

### jest.config.js
Configuración principal de Jest con:
- Entorno jsdom para tests de React
- Alias de módulos (@/...)
- Umbrales de cobertura
- Patrones de archivos a testear

### jest.setup.js
Configuración inicial con:
- jest-dom para matchers adicionales
- Mocks de next/navigation
- Mocks de next/link
- Supresión de errores de consola

## Mocks

### API Mock
Los tests usan `jest.mock('@/lib/api')` para simular llamadas HTTP.

### Next.js Mocks
- `useRouter` - Mock del router de Next.js
- `usePathname` - Mock del pathname
- `Link` - Mock de componente Link

## Buenas Prácticas

1. **Arrange-Act-Assert**: Organizar tests en tres fases
2. **Cleanup**: Limpiar mocks antes de cada test
3. **Async/Await**: Usar waitFor para operaciones asíncronas
4. **Descriptive Names**: Nombres descriptivos en español
5. **Isolation**: Cada test debe ser independiente

## Ejemplos

### Test de Componente
```javascript
it('debe renderizar la tabla con empleados', () => {
  render(
    <EmployeeTable
      data={mockEmployees}
      pagination={mockPagination}
      isLoading={false}
      onPageChange={mockOnPageChange}
    />
  );

  expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
});
```

### Test de Hook
```javascript
it('debe obtener lista de empleados', async () => {
  api.get.mockResolvedValue(mockData);

  const { result } = renderHook(() => useEmployees({ page: 1 }), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data.data).toHaveLength(1);
});
```

### Test de Integración
```javascript
it('debe mostrar la lista de empleados', async () => {
  api.get.mockResolvedValue(mockEmployees);

  render(
    <QueryClientProvider client={queryClient}>
      <EmpleadosPage />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Error: Cannot find module '@/...'
Verificar que `jest.config.js` tenga el moduleNameMapper configurado.

### Error: useRouter is not a function
Verificar que `jest.setup.js` tenga los mocks de next/navigation.

### Tests lentos
Usar `--maxWorkers=50%` para limitar workers:
```bash
npm test -- --maxWorkers=50%
```

## Próximos Tests a Implementar

- [ ] Tests de página de expediente digital
- [ ] Tests de módulo de nómina
- [ ] Tests de módulo de asistencia
- [ ] Tests de módulo de vacaciones
- [ ] Tests de portal del empleado
- [ ] Tests E2E con Playwright

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)
