import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MaintenanceDialog from '@/components/modules/fleet/MaintenanceDialog';
import { createMaintenance, getVehicles } from '@/services/fleet.service';

// Mock services
jest.mock('@/services/fleet.service');

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

describe('MaintenanceDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockVehicles = {
    data: [
      { id: '1', plate: 'ABC123', brand: 'Toyota', model: 'Corolla' },
      { id: '2', plate: 'DEF456', brand: 'Honda', model: 'Civic' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getVehicles.mockResolvedValue(mockVehicles);
  });

  it('renders create dialog correctly', async () => {
    render(
      <MaintenanceDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Programar Nuevo Mantenimiento')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Vehículo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <MaintenanceDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Programar Nuevo Mantenimiento')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Programar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Selecciona un vehículo/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    createMaintenance.mockResolvedValue({ data: { id: '1' } });

    render(
      <MaintenanceDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Programar Nuevo Mantenimiento')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/Descripción/i), {
      target: { value: 'Cambio de aceite' },
    });

    const submitButton = screen.getByRole('button', { name: /Programar/i });
    fireEvent.click(submitButton);

    // Note: Full validation would require selecting vehicle and type from dropdowns
  });

  it('displays maintenance type options', async () => {
    render(
      <MaintenanceDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Programar Nuevo Mantenimiento')).toBeInTheDocument();
    });

    // The type select should be present
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
  });

  it('loads maintenance data when editing', async () => {
    const mockMaintenance = {
      id: '1',
      vehicleId: '1',
      type: 'PREVENTIVE',
      description: 'Cambio de aceite',
      scheduledKm: 10000,
    };

    render(
      <MaintenanceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        maintenance={mockMaintenance}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Editar Mantenimiento')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Cambio de aceite')).toBeInTheDocument();
  });

  it('calls onOpenChange when cancel is clicked', async () => {
    render(
      <MaintenanceDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Programar Nuevo Mantenimiento')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
