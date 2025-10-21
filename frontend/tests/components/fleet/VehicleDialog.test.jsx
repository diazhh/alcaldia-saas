import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VehicleDialog from '@/components/modules/fleet/VehicleDialog';
import { createVehicle, updateVehicle } from '@/services/fleet.service';

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

describe('VehicleDialog', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create dialog correctly', () => {
    render(
      <VehicleDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Registrar Nuevo Vehículo')).toBeInTheDocument();
    expect(screen.getByLabelText(/Placa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Marca/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Modelo/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <VehicleDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Ingresa la placa/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    createVehicle.mockResolvedValue({ data: { id: '1' } });

    render(
      <VehicleDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Placa/i), {
      target: { value: 'ABC123' },
    });
    fireEvent.change(screen.getByLabelText(/Marca/i), {
      target: { value: 'Toyota' },
    });
    fireEvent.change(screen.getByLabelText(/Modelo/i), {
      target: { value: 'Corolla' },
    });
    fireEvent.change(screen.getByLabelText(/Año/i), {
      target: { value: '2020' },
    });

    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createVehicle).toHaveBeenCalled();
    });
  });

  it('loads vehicle data when editing', () => {
    const mockVehicle = {
      id: '1',
      plate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      type: 'SEDAN',
      status: 'ACTIVE',
    };

    render(
      <VehicleDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        vehicle={mockVehicle}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Editar Vehículo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ABC123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
  });

  it('calls onOpenChange when cancel is clicked', () => {
    render(
      <VehicleDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
