import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployees, useEmployee, useCreateEmployee } from '@/hooks/hr/useEmployees';
import api from '@/lib/api';

// Mock del módulo api
jest.mock('@/lib/api');

// Wrapper para React Query
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

describe('useEmployees Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useEmployees', () => {
    it('debe obtener lista de empleados', async () => {
      const mockData = {
        data: {
          data: {
            data: [
              {
                id: 'emp-1',
                firstName: 'Juan',
                lastName: 'Pérez',
                employeeNumber: 'EMP-2024-0001',
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

      api.get.mockResolvedValue(mockData);

      const { result } = renderHook(() => useEmployees({ page: 1, limit: 20 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data.data).toHaveLength(1);
      expect(result.current.data.data[0].firstName).toBe('Juan');
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/hr/employees'));
    });

    it('debe aplicar filtros correctamente', async () => {
      const mockData = {
        data: {
          data: {
            data: [],
            pagination: { total: 0, page: 1, limit: 20, pages: 0 },
          },
        },
      };

      api.get.mockResolvedValue(mockData);

      const filters = {
        page: 1,
        limit: 20,
        status: 'ACTIVE',
        search: 'Juan',
      };

      renderHook(() => useEmployees(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('status=ACTIVE')
        );
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('search=Juan')
        );
      });
    });
  });

  describe('useEmployee', () => {
    it('debe obtener un empleado por ID', async () => {
      const mockData = {
        data: {
          data: {
            id: 'emp-1',
            firstName: 'Juan',
            lastName: 'Pérez',
            employeeNumber: 'EMP-2024-0001',
          },
        },
      };

      api.get.mockResolvedValue(mockData);

      const { result } = renderHook(() => useEmployee('emp-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data.firstName).toBe('Juan');
      expect(api.get).toHaveBeenCalledWith('/hr/employees/emp-1');
    });

    it('no debe hacer la petición si no hay ID', () => {
      renderHook(() => useEmployee(null), {
        wrapper: createWrapper(),
      });

      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateEmployee', () => {
    it('debe crear un empleado exitosamente', async () => {
      const mockEmployee = {
        id: 'emp-new',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        employeeNumber: 'EMP-2024-0003',
      };

      const mockResponse = {
        data: {
          data: mockEmployee,
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper(),
      });

      const newEmployeeData = {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        idNumber: 'V-11111111',
        email: 'carlos.rodriguez@test.com',
        positionId: 'pos-1',
        hireDate: '2024-01-15',
        baseSalary: 600,
      };

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
});
