import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignatureTable } from '@/components/modules/documents/SignatureTable';
import api from '@/lib/api';
import { toast } from 'sonner';

jest.mock('@/lib/api');
jest.mock('sonner');

describe('SignatureTable', () => {
  const mockOnRefetch = jest.fn();
  const mockSignatures = [
    {
      id: '1',
      documentId: 'doc1',
      document: {
        subject: 'Documento de prueba 1',
        createdBy: { name: 'Admin' },
      },
      requestedAt: '2024-01-15T10:00:00Z',
      order: 1,
      status: 'PENDING',
    },
    {
      id: '2',
      documentId: 'doc2',
      document: {
        subject: 'Documento de prueba 2',
        createdBy: { name: 'Usuario' },
      },
      requestedAt: '2024-01-16T10:00:00Z',
      order: 2,
      status: 'SIGNED',
      signedAt: '2024-01-16T15:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signature table with data', () => {
    render(
      <SignatureTable
        data={mockSignatures}
        isLoading={false}
        onRefetch={mockOnRefetch}
      />
    );

    expect(screen.getByText('Documento de prueba 1')).toBeInTheDocument();
    expect(screen.getByText('Documento de prueba 2')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <SignatureTable
        data={[]}
        isLoading={true}
        onRefetch={mockOnRefetch}
      />
    );

    expect(screen.getByText(/Cargando firmas/i)).toBeInTheDocument();
  });

  it('shows empty state when no signatures', () => {
    render(
      <SignatureTable
        data={[]}
        isLoading={false}
        onRefetch={mockOnRefetch}
      />
    );

    expect(screen.getByText(/No hay documentos pendientes de firma/i)).toBeInTheDocument();
  });

  it('shows action buttons for pending signatures', () => {
    render(
      <SignatureTable
        data={mockSignatures}
        isLoading={false}
        onRefetch={mockOnRefetch}
      />
    );

    const signButtons = screen.getAllByRole('button', { name: /Firmar/i });
    const rejectButtons = screen.getAllByRole('button', { name: /Rechazar/i });

    expect(signButtons).toHaveLength(1); // Only for pending signature
    expect(rejectButtons).toHaveLength(1);
  });

  it('opens sign confirmation dialog', async () => {
    render(
      <SignatureTable
        data={mockSignatures}
        isLoading={false}
        onRefetch={mockOnRefetch}
      />
    );

    const signButton = screen.getByRole('button', { name: /Firmar/i });
    fireEvent.click(signButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmar Firma/i)).toBeInTheDocument();
    });
  });

  it('signs document successfully', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    render(
      <SignatureTable
        data={mockSignatures}
        isLoading={false}
        onRefetch={mockOnRefetch}
      />
    );

    const signButton = screen.getByRole('button', { name: /Firmar/i });
    fireEvent.click(signButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmar Firma/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirmar Firma/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/documents/signatures', {
        documentId: 'doc1',
      });
      expect(toast.success).toHaveBeenCalledWith('Documento firmado exitosamente');
      expect(mockOnRefetch).toHaveBeenCalled();
    });
  });

  it('opens reject dialog and requires reason', async () => {
    render(
      <SignatureTable
        data={mockSignatures}
        isLoading={false}
        onRefetch={mockOnRefetch}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /Rechazar/i });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText(/Rechazar Firma/i)).toBeInTheDocument();
    });

    const confirmRejectButton = screen.getByRole('button', { name: /Confirmar Rechazo/i });
    expect(confirmRejectButton).toBeDisabled(); // Should be disabled without reason
  });

  it('rejects signature with reason', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    render(
      <SignatureTable
        data={mockSignatures}
        isLoading={false}
        onRefetch={mockOnRefetch}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /Rechazar/i });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText(/Rechazar Firma/i)).toBeInTheDocument();
    });

    const reasonTextarea = screen.getByLabelText(/Motivo del Rechazo/i);
    fireEvent.change(reasonTextarea, {
      target: { value: 'Documento incompleto' },
    });

    const confirmRejectButton = screen.getByRole('button', { name: /Confirmar Rechazo/i });
    fireEvent.click(confirmRejectButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/documents/signatures/1/reject',
        { reason: 'Documento incompleto' }
      );
      expect(toast.success).toHaveBeenCalledWith('Firma rechazada');
      expect(mockOnRefetch).toHaveBeenCalled();
    });
  });
});
