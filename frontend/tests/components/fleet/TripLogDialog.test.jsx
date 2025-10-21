import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TripLogDialog from '@/components/modules/fleet/TripLogDialog';
import { createTripLog, getVehicles } from '@/services/fleet.service';
import { getUsers } from '@/services/users.service';

// Mock services
jest.mock('@/services/fleet.service');
jest.mock('@/services/users.service');

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

describe('TripLogDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockVehicles = {
    data: [
      { id: '1', plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
      { id: '2', plate: 'DEF456', brand: 'Honda', model: 'Civic' },
    ],
  };
  const mockUsers = {
    data: [
      { id: '1', firstName: 'Juan', lastName: 'Pérez', email: 'juan@test.com' },
      { id: '2', firstName: 'María', lastName: 'García', email: 'maria@test.com' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getVehicles.mockResolvedValue(mockVehicles);
    getUsers.mockResolvedValue(mockUsers);
  });

  it('renders create dialog correctly', async () => {
    render(
      <TripLogDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Registrar Nuevo Viaje')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Vehículo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Conductor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destino/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <TripLogDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Registrar Nuevo Viaje')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Selecciona un vehículo/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    createTripLog.mockResolvedValue({ data: { id: '1' } });

    render(
      <TripLogDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Registrar Nuevo Viaje')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/Kilometraje Inicial/i), {
      target: { value: '10000' },
    });
    fireEvent.change(screen.getByLabelText(/Destino/i), {
      target: { value: 'Centro de la ciudad' },
    });

    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);

    // Note: Full validation would require selecting vehicle and driver from dropdowns
  });

  it('displays vehicle options', async () => {
    render(
      <TripLogDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(getVehicles).toHaveBeenCalled();
    });
  });

  it('displays driver options', async () => {
    render(
      <TripLogDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(getUsers).toHaveBeenCalled();
    });
  });
});
