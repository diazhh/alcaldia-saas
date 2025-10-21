import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateDepartmentModal from '@/components/modules/departments/CreateDepartmentModal';

// Mock the hooks
jest.mock('@/hooks/useDepartments', () => ({
  useCreateDepartment: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useDepartmentTree: () => ({
    data: [],
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('CreateDepartmentModal Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockOnOpenChange = jest.fn();

  const renderModal = (open = true) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CreateDepartmentModal open={open} onOpenChange={mockOnOpenChange} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  test('renders modal when open', () => {
    renderModal(true);
    expect(screen.getByText('Crear Nuevo Departamento')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    renderModal(false);
    expect(screen.queryByText('Crear Nuevo Departamento')).not.toBeInTheDocument();
  });

  test('displays all required form fields', () => {
    renderModal(true);

    expect(screen.getByLabelText(/Código/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty required fields', async () => {
    renderModal(true);

    const submitButton = screen.getByText('Crear Departamento');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/El código debe tener al menos 2 caracteres/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    renderModal(true);

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('Crear Departamento');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });
  });

  test('allows filling out the form', () => {
    renderModal(true);

    const codeInput = screen.getByLabelText(/Código/i);
    const nameInput = screen.getByLabelText(/Nombre/i);

    fireEvent.change(codeInput, { target: { value: 'DIR-001' } });
    fireEvent.change(nameInput, { target: { value: 'Dirección General' } });

    expect(codeInput).toHaveValue('DIR-001');
    expect(nameInput).toHaveValue('Dirección General');
  });

  test('has cancel button that closes modal', () => {
    renderModal(true);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
