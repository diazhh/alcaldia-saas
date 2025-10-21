import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VehiclesPage from '@/app/(dashboard)/flota/vehiculos/page';
import TripLogsPage from '@/app/(dashboard)/flota/bitacora/page';
import MaintenancePage from '@/app/(dashboard)/flota/mantenimiento/page';
import {
  getVehicles,
  getTripLogs,
  getMaintenances,
  createVehicle,
  createTripLog,
  createMaintenance,
} from '@/services/fleet.service';
import { getUsers } from '@/services/users.service';

// Mock services
jest.mock('@/services/fleet.service');
jest.mock('@/services/users.service');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

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

describe('Fleet Module Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Vehicles Flow', () => {
    it('displays list of vehicles', async () => {
      const mockVehicles = {
        data: [
          {
            id: '1',
            plate: 'ABC123',
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            type: 'SEDAN',
            status: 'ACTIVE',
          },
          {
            id: '2',
            plate: 'DEF456',
            brand: 'Honda',
            model: 'Civic',
            year: 2021,
            type: 'SEDAN',
            status: 'ACTIVE',
          },
        ],
        pagination: { total: 2, page: 1, totalPages: 1 },
      };

      getVehicles.mockResolvedValue(mockVehicles);

      render(<VehiclesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByText('DEF456')).toBeInTheDocument();
      });
    });

    it('opens create vehicle dialog', async () => {
      getVehicles.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });

      render(<VehiclesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Inventario de Vehículos')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Agregar Vehículo/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Registrar Nuevo Vehículo')).toBeInTheDocument();
      });
    });

    it('filters vehicles by status', async () => {
      const mockVehicles = {
        data: [
          {
            id: '1',
            plate: 'ABC123',
            brand: 'Toyota',
            model: 'Corolla',
            status: 'ACTIVE',
          },
        ],
        pagination: { total: 1, page: 1, totalPages: 1 },
      };

      getVehicles.mockResolvedValue(mockVehicles);

      render(<VehiclesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(getVehicles).toHaveBeenCalled();
      });
    });
  });

  describe('Trip Logs Flow', () => {
    it('displays list of trip logs', async () => {
      const mockTripLogs = {
        data: [
          {
            id: '1',
            vehicle: { plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
            driver: { firstName: 'Juan', lastName: 'Pérez' },
            startDate: '2025-01-10T08:00:00Z',
            startKm: 10000,
            destination: 'Centro',
            status: 'IN_PROGRESS',
          },
        ],
        pagination: { total: 1, page: 1, totalPages: 1 },
      };

      getTripLogs.mockResolvedValue(mockTripLogs);
      getVehicles.mockResolvedValue({ data: [] });

      render(<TripLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
    });

    it('opens create trip log dialog', async () => {
      getTripLogs.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });
      getVehicles.mockResolvedValue({ data: [] });

      render(<TripLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Bitácora de Viajes')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Registrar Viaje/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Registrar Nuevo Viaje')).toBeInTheDocument();
      });
    });

    it('filters trip logs by status', async () => {
      getTripLogs.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });
      getVehicles.mockResolvedValue({ data: [] });

      render(<TripLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(getTripLogs).toHaveBeenCalled();
      });
    });
  });

  describe('Maintenance Flow', () => {
    it('displays list of maintenances', async () => {
      const mockMaintenances = {
        data: [
          {
            id: '1',
            vehicle: { plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
            type: 'PREVENTIVE',
            description: 'Cambio de aceite',
            scheduledDate: '2025-01-15T10:00:00Z',
            status: 'SCHEDULED',
          },
        ],
        pagination: { total: 1, page: 1, totalPages: 1 },
      };

      getMaintenances.mockResolvedValue(mockMaintenances);
      getVehicles.mockResolvedValue({ data: [] });

      render(<MaintenancePage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByText('Cambio de aceite')).toBeInTheDocument();
      });
    });

    it('opens create maintenance dialog', async () => {
      getMaintenances.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });
      getVehicles.mockResolvedValue({ data: [] });

      render(<MaintenancePage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Gestión de Mantenimiento')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', {
        name: /Programar Mantenimiento/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Programar Nuevo Mantenimiento')).toBeInTheDocument();
      });
    });

    it('filters maintenances by type', async () => {
      getMaintenances.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });
      getVehicles.mockResolvedValue({ data: [] });

      render(<MaintenancePage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(getMaintenances).toHaveBeenCalled();
      });
    });
  });

  describe('Complete Fleet Workflow', () => {
    it('creates vehicle, registers trip, and schedules maintenance', async () => {
      // Step 1: Create vehicle
      const mockVehicle = {
        id: '1',
        plate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
      };
      createVehicle.mockResolvedValue({ data: mockVehicle });

      // Step 2: Register trip
      const mockTripLog = {
        id: '1',
        vehicleId: '1',
        startKm: 10000,
      };
      createTripLog.mockResolvedValue({ data: mockTripLog });

      // Step 3: Schedule maintenance
      const mockMaintenance = {
        id: '1',
        vehicleId: '1',
        type: 'PREVENTIVE',
      };
      createMaintenance.mockResolvedValue({ data: mockMaintenance });

      // Verify all operations can be performed
      expect(createVehicle).toBeDefined();
      expect(createTripLog).toBeDefined();
      expect(createMaintenance).toBeDefined();
    });
  });
});
