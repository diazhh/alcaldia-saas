import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import AssetDialog from '@/components/modules/assets/AssetDialog';
import { createAsset, updateAsset } from '@/services/assets.service';

jest.mock('@/services/assets.service');
jest.mock('sonner');

describe('AssetDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create mode correctly', () => {
    render(<AssetDialog open={true} onClose={mockOnClose} asset={null} />);
    
    expect(screen.getByText('Nuevo Bien')).toBeInTheDocument();
    expect(screen.getByText('Registra un nuevo bien municipal')).toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    const mockAsset = {
      id: '1',
      name: 'Computadora Dell',
      type: 'COMPUTER',
      status: 'ACTIVE',
    };

    render(<AssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />);
    
    expect(screen.getByText('Editar Bien')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Computadora Dell')).toBeInTheDocument();
  });

  it('creates a new asset successfully', async () => {
    createAsset.mockResolvedValue({ data: { id: '1' } });

    render(<AssetDialog open={true} onClose={mockOnClose} asset={null} />);
    
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Nueva Computadora' },
    });
    
    fireEvent.change(screen.getByLabelText(/Fecha de Adquisición/i), {
      target: { value: '2025-01-01' },
    });
    
    fireEvent.change(screen.getByLabelText(/Valor de Adquisición/i), {
      target: { value: '1000' },
    });

    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
      expect(createAsset).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Bien creado exitosamente');
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it('updates an existing asset successfully', async () => {
    const mockAsset = {
      id: '1',
      name: 'Computadora Dell',
      type: 'COMPUTER',
      status: 'ACTIVE',
      acquisitionDate: '2024-01-01',
      acquisitionValue: 1000,
      usefulLife: 60,
    };

    updateAsset.mockResolvedValue({ data: mockAsset });

    render(<AssetDialog open={true} onClose={mockOnClose} asset={mockAsset} />);
    
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Computadora HP' },
    });

    fireEvent.click(screen.getByText('Actualizar'));

    await waitFor(() => {
      expect(updateAsset).toHaveBeenCalledWith('1', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Bien actualizado exitosamente');
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it('handles errors when creating asset', async () => {
    createAsset.mockRejectedValue({
      response: { data: { message: 'Error al crear bien' } },
    });

    render(<AssetDialog open={true} onClose={mockOnClose} asset={null} />);
    
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Nueva Computadora' },
    });
    
    fireEvent.change(screen.getByLabelText(/Fecha de Adquisición/i), {
      target: { value: '2025-01-01' },
    });
    
    fireEvent.change(screen.getByLabelText(/Valor de Adquisición/i), {
      target: { value: '1000' },
    });

    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al crear bien');
    });
  });

  it('closes dialog when cancel is clicked', () => {
    render(<AssetDialog open={true} onClose={mockOnClose} asset={null} />);
    
    fireEvent.click(screen.getByText('Cancelar'));
    
    expect(mockOnClose).toHaveBeenCalledWith(false);
  });
});
