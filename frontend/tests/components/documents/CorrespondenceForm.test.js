import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CorrespondenceForm } from '@/components/modules/documents/CorrespondenceForm';
import api from '@/lib/api';

jest.mock('@/lib/api');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('CorrespondenceForm', () => {
  const mockOnClose = jest.fn();
  const mockDepartments = {
    data: [
      { id: '1', name: 'Departamento 1' },
      { id: '2', name: 'Departamento 2' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockDepartments });
  });

  it('renders incoming correspondence form correctly', async () => {
    render(
      <CorrespondenceForm type="incoming" onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/Nueva Correspondencia Entrante/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Remitente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destino/i)).toBeInTheDocument();
  });

  it('renders outgoing correspondence form correctly', async () => {
    render(
      <CorrespondenceForm type="outgoing" onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/Nueva Correspondencia Saliente/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Destinatario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección del Destinatario/i)).toBeInTheDocument();
  });

  it('submits incoming correspondence successfully', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    render(
      <CorrespondenceForm type="incoming" onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Remitente/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Remitente/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Asunto/i), {
      target: { value: 'Solicitud de información' },
    });

    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/documents/correspondence/incoming',
        expect.objectContaining({
          sender: 'Juan Pérez',
          subject: 'Solicitud de información',
        })
      );
    });
  });

  it('shows validation errors for required fields', async () => {
    render(
      <CorrespondenceForm type="incoming" onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Remitente/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/El remitente es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/El asunto es requerido/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    render(
      <CorrespondenceForm type="incoming" onClose={mockOnClose} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Remitente/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
