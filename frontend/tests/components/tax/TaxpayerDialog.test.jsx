import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxpayerDialog from '@/components/modules/tax/TaxpayerDialog';
import axios from 'axios';

jest.mock('axios');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

describe('TaxpayerDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el diálogo para nuevo contribuyente', () => {
    render(<TaxpayerDialog open={true} onClose={mockOnClose} taxpayer={null} />);

    expect(screen.getByText('Nuevo Contribuyente')).toBeInTheDocument();
    expect(screen.getByLabelText(/RIF \/ Cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre \/ Razón Social/i)).toBeInTheDocument();
  });

  it('debe renderizar el diálogo para editar contribuyente', () => {
    const mockTaxpayer = {
      id: '1',
      taxId: 'V-12345678',
      name: 'Juan Pérez',
      type: 'NATURAL',
      email: 'juan@example.com',
      phone: '0414-1234567',
      address: 'Calle Principal',
    };

    render(<TaxpayerDialog open={true} onClose={mockOnClose} taxpayer={mockTaxpayer} />);

    expect(screen.getByText('Editar Contribuyente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('V-12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
  });

  it('debe validar campos requeridos', async () => {
    render(<TaxpayerDialog open={true} onClose={mockOnClose} taxpayer={null} />);

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    // El formulario HTML5 debería prevenir el envío
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('debe crear un nuevo contribuyente', async () => {
    axios.post.mockResolvedValue({ data: { id: '1' } });

    render(<TaxpayerDialog open={true} onClose={mockOnClose} taxpayer={null} />);

    fireEvent.change(screen.getByLabelText(/RIF \/ Cédula/i), {
      target: { value: 'V-12345678' },
    });
    fireEvent.change(screen.getByLabelText(/Nombre \/ Razón Social/i), {
      target: { value: 'Juan Pérez' },
    });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/tax/taxpayers'),
        expect.objectContaining({
          taxId: 'V-12345678',
          name: 'Juan Pérez',
        }),
        expect.any(Object)
      );
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it('debe actualizar un contribuyente existente', async () => {
    axios.put.mockResolvedValue({ data: { id: '1' } });

    const mockTaxpayer = {
      id: '1',
      taxId: 'V-12345678',
      name: 'Juan Pérez',
      type: 'NATURAL',
    };

    render(<TaxpayerDialog open={true} onClose={mockOnClose} taxpayer={mockTaxpayer} />);

    fireEvent.change(screen.getByLabelText(/Nombre \/ Razón Social/i), {
      target: { value: 'Juan Pérez Actualizado' },
    });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/tax/taxpayers/1'),
        expect.objectContaining({
          name: 'Juan Pérez Actualizado',
        }),
        expect.any(Object)
      );
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it('debe cerrar el diálogo al cancelar', () => {
    render(<TaxpayerDialog open={true} onClose={mockOnClose} taxpayer={null} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it('debe manejar errores al guardar', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    axios.post.mockRejectedValue({
      response: { data: { message: 'Error al guardar' } },
    });

    render(<TaxpayerDialog open={true} onClose={mockOnClose} taxpayer={null} />);

    fireEvent.change(screen.getByLabelText(/RIF \/ Cédula/i), {
      target: { value: 'V-12345678' },
    });
    fireEvent.change(screen.getByLabelText(/Nombre \/ Razón Social/i), {
      target: { value: 'Juan Pérez' },
    });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error al guardar');
    });

    alertMock.mockRestore();
  });
});
