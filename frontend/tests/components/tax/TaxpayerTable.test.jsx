import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxpayerTable from '@/components/modules/tax/TaxpayerTable';
import axios from 'axios';

jest.mock('axios');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

describe('TaxpayerTable', () => {
  const mockTaxpayers = [
    {
      id: '1',
      taxId: 'V-12345678',
      name: 'Juan Pérez',
      type: 'NATURAL',
      email: 'juan@example.com',
      phone: '0414-1234567',
    },
    {
      id: '2',
      taxId: 'J-123456789',
      name: 'Empresa ABC, C.A.',
      type: 'LEGAL',
      email: 'info@abc.com',
      phone: '0212-1234567',
    },
  ];

  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockTaxpayers });
  });

  it('debe renderizar la tabla con contribuyentes', async () => {
    render(<TaxpayerTable onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText('V-12345678')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('J-123456789')).toBeInTheDocument();
      expect(screen.getByText('Empresa ABC, C.A.')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje de carga inicialmente', () => {
    render(<TaxpayerTable onEdit={mockOnEdit} />);
    expect(screen.getByText('Cargando contribuyentes...')).toBeInTheDocument();
  });

  it('debe filtrar contribuyentes por búsqueda', async () => {
    render(<TaxpayerTable onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'Juan' } });

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Empresa ABC, C.A.')).not.toBeInTheDocument();
  });

  it('debe llamar a onEdit cuando se hace clic en editar', async () => {
    render(<TaxpayerTable onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('svg'));
    
    if (editButton) {
      fireEvent.click(editButton);
      await waitFor(() => {
        expect(mockOnEdit).toHaveBeenCalled();
      });
    }
  });

  it('debe mostrar diálogo de confirmación al eliminar', async () => {
    axios.delete.mockResolvedValue({});
    
    render(<TaxpayerTable onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg && btn.className.includes('text-red-600');
    });

    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByText('¿Está seguro?')).toBeInTheDocument();
      });
    }
  });

  it('debe mostrar mensaje cuando no hay contribuyentes', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(<TaxpayerTable onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText('No se encontraron contribuyentes')).toBeInTheDocument();
    });
  });
});
