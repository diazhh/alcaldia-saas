import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployees, useCreateEmployee } from '@/hooks/hr/useEmployees';
import api from '@/lib/api';

// Mock del módulo api
jest.mock('@/lib/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Flujo de Gestión de Empleados - Integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Obtener y listar empleados', () => {
    it('debe obtener lista de empleados con filtros', async () => {
      const mockEmployees = {
        data: {
          data: {
            data: [
              {
                id: 'emp-1',
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan.perez@test.com',
                employeeNumber: 'EMP-2024-0001',
                idNumber: 'V-12345678',
                status: 'ACTIVE',
                position: { name: 'Analista' },
                department: { name: 'TI' },
              },
            ],
            pagination: {
              total: 1,
              page: 1,
              limit: 20,
              pages: 1,
            },
          },
        },
      };

      api.get.mockResolvedValue(mockEmployees);

      const { result } = renderHook(
        () => useEmployees({ page: 1, limit: 20, status: 'ACTIVE' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data.data).toHaveLength(1);
      expect(result.current.data.data[0].firstName).toBe('Juan');
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('status=ACTIVE'));
    });

    it('debe buscar empleados por término de búsqueda', async () => {
      const mockEmployees = {
        data: {
          data: {
            data: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 20,
              pages: 0,
            },
          },
        },
      };

      api.get.mockResolvedValue(mockEmployees);

      const { result } = renderHook(
        () => useEmployees({ search: 'Juan', page: 1, limit: 20 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=Juan'));
    });
  });

  describe('Crear empleado', () => {
    it('debe crear un empleado y actualizar la lista', async () => {
      const newEmployeeData = {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        idNumber: 'V-11111111',
        email: 'carlos.rodriguez@test.com',
        positionId: 'pos-1',
        hireDate: '2024-01-15',
        baseSalary: 600,
      };

      const mockResponse = {
        data: {
          data: {
            id: 'emp-new',
            ...newEmployeeData,
            employeeNumber: 'EMP-2024-0003',
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newEmployeeData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data.firstName).toBe('Carlos');
      expect(api.post).toHaveBeenCalledWith('/hr/employees', newEmployeeData);
    });

    it('debe manejar errores al crear empleado', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Email ya existe',
          },
        },
      };

      api.post.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper(),
      });

      const newEmployeeData = {
        firstName: 'Pedro',
        lastName: 'Martínez',
        email: 'duplicate@test.com',
      };

      result.current.mutate(newEmployeeData);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Flujo completo de gestión', () => {
    it('debe permitir crear, listar y filtrar empleados', async () => {
      // 1. Crear empleado
      const createMockResponse = {
        data: {
          data: {
            id: 'emp-1',
            firstName: 'Ana',
            lastName: 'López',
            employeeNumber: 'EMP-2024-0001',
          },
        },
      };

      api.post.mockResolvedValue(createMockResponse);

      const { result: createResult } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper(),
      });

      createResult.current.mutate({
        firstName: 'Ana',
        lastName: 'López',
        idNumber: 'V-22222222',
        email: 'ana.lopez@test.com',
        positionId: 'pos-1',
        hireDate: '2024-01-15',
        baseSalary: 550,
      });

      await waitFor(() => expect(createResult.current.isSuccess).toBe(true));

      // 2. Listar empleados
      const listMockResponse = {
        data: {
          data: {
            data: [createMockResponse.data.data],
            pagination: {
              total: 1,
              page: 1,
              limit: 20,
              pages: 1,
            },
          },
        },
      };

      api.get.mockResolvedValue(listMockResponse);

      const { result: listResult } = renderHook(() => useEmployees({ page: 1 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

      expect(listResult.current.data.data).toHaveLength(1);
      expect(listResult.current.data.data[0].firstName).toBe('Ana');
    });
  });
});
