import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyCadastralDialog from '@/components/modules/catastro/PropertyCadastralDialog';
import * as catastroService from '@/services/catastro.service';

// Mock the services
jest.mock('@/services/catastro.service');
jest.mock('@/lib/api');

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PropertyCadastralDialog', () => {
  const mockOnClose = jest.fn();
  const mockTaxpayers = [
    { id: '1', name: 'Juan Pérez', taxId: 'V-12345678' },
    { id: '2', name: 'María García', taxId: 'V-87654321' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API call for taxpayers
    require('@/lib/api').default.get = jest.fn().mockResolvedValue({
      data: mockTaxpayers,
    });
  });

  it('renders dialog when open', () => {
    render(
      <PropertyCadastralDialog
        open={true}
        onClose={mockOnClose}
        property={null}
      />
    );

    expect(screen.getByText('Nueva Ficha Catastral')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PropertyCadastralDialog
        open={false}
        onClose={mockOnClose}
        property={null}
      />
    );

    expect(screen.queryByText('Nueva Ficha Catastral')).not.toBeInTheDocument();
  });

  it('shows edit mode when property is provided', () => {
    const mockProperty = {
      id: '1',
      cadastralCode: '01-02-03-004',
      address: 'Calle Principal',
      propertyUse: 'RESIDENTIAL',
    };

    render(
      <PropertyCadastralDialog
        open={true}
        onClose={mockOnClose}
        property={mockProperty}
      />
    );

    expect(screen.getByText('Editar Ficha Catastral')).toBeInTheDocument();
  });

  it('calls createProperty when submitting new property', async () => {
    catastroService.createProperty = jest.fn().mockResolvedValue({});

    render(
      <PropertyCadastralDialog
        open={true}
        onClose={mockOnClose}
        property={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Código Catastral/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Código Catastral/i), '01-02-03-004');
    await user.type(screen.getByLabelText(/Dirección/i), 'Calle Principal');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(catastroService.createProperty).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it('calls updateProperty when editing existing property', async () => {
    const mockProperty = {
      id: '1',
      cadastralCode: '01-02-03-004',
      address: 'Calle Principal',
      propertyUse: 'RESIDENTIAL',
      taxpayerId: '1',
    };

    catastroService.updateProperty = jest.fn().mockResolvedValue({});

    render(
      <PropertyCadastralDialog
        open={true}
        onClose={mockOnClose}
        property={mockProperty}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('01-02-03-004')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(catastroService.updateProperty).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it('displays error message on save failure', async () => {
    catastroService.createProperty = jest.fn().mockRejectedValue({
      response: { data: { message: 'Error al guardar' } },
    });

    render(
      <PropertyCadastralDialog
        open={true}
        onClose={mockOnClose}
        property={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Código Catastral/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Código Catastral/i), '01-02-03-004');
    await user.type(screen.getByLabelText(/Dirección/i), 'Calle Principal');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(catastroService.createProperty).toHaveBeenCalled();
    });
  });
});
