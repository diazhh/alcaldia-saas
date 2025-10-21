import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MesaEntradaPage from '@/app/(dashboard)/documentos/mesa-entrada/page';
import OrdenanzasPage from '@/app/(dashboard)/documentos/ordenanzas/page';
import api from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/documentos/mesa-entrada',
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Document Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mesa de Entrada', () => {
    it('renders mesa de entrada page with stats', async () => {
      api.get.mockImplementation((url) => {
        if (url.includes('/stats')) {
          return Promise.resolve({
            data: {
              data: {
                incomingToday: 5,
                outgoingToday: 3,
                pending: 10,
                delivered: 20,
                archived: 50,
              },
            },
          });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<MesaEntradaPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Mesa de Entrada')).toBeInTheDocument();
      });

      // Check stats are displayed
      await waitFor(() => {
        expect(screen.getByText('Entrada Hoy')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Salida Hoy')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('opens new incoming correspondence form', async () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      render(<MesaEntradaPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Mesa de Entrada')).toBeInTheDocument();
      });

      const newButton = screen.getByRole('button', { name: /Nueva Entrada/i });
      fireEvent.click(newButton);

      await waitFor(() => {
        expect(screen.getByText(/Nueva Correspondencia Entrante/i)).toBeInTheDocument();
      });
    });

    it('tracks correspondence by reference', async () => {
      const mockTracking = {
        data: {
          reference: 'ENT-2024-001',
          subject: 'Solicitud de información',
          type: 'INCOMING',
          status: 'DELIVERED',
          sender: 'Juan Pérez',
          registrationDate: '2024-01-15T10:00:00Z',
          deliveredAt: '2024-01-16T10:00:00Z',
        },
      };

      api.get.mockImplementation((url) => {
        if (url.includes('/track/')) {
          return Promise.resolve(mockTracking);
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<MesaEntradaPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Mesa de Entrada')).toBeInTheDocument();
      });

      const trackInput = screen.getByPlaceholderText(/ENT-2024-001234/i);
      fireEvent.change(trackInput, { target: { value: 'ENT-2024-001' } });

      const trackButton = screen.getByRole('button', { name: /Rastrear/i });
      fireEvent.click(trackButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          '/api/documents/correspondence/track/ENT-2024-001'
        );
      });
    });
  });

  describe('Ordinances Portal', () => {
    const mockOrdinances = [
      {
        id: '1',
        number: 'ORD-2024-001',
        title: 'Ordenanza de Tránsito',
        subject: 'Tránsito y Transporte',
        summary: 'Regula el tránsito vehicular en el municipio',
        status: 'ACTIVE',
        sanctionDate: '2024-01-01T00:00:00Z',
        publicationDate: '2024-01-15T00:00:00Z',
        effectiveDate: '2024-02-01T00:00:00Z',
      },
      {
        id: '2',
        number: 'ORD-2024-002',
        title: 'Ordenanza de Impuestos Municipales',
        subject: 'Hacienda Pública',
        summary: 'Establece los impuestos municipales',
        status: 'ACTIVE',
        sanctionDate: '2024-01-10T00:00:00Z',
      },
    ];

    it('renders ordinances portal with active ordinances', async () => {
      api.get.mockResolvedValue({
        data: { data: mockOrdinances },
      });

      render(<OrdenanzasPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Ordenanzas Municipales')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Ordenanza de Tránsito')).toBeInTheDocument();
        expect(screen.getByText('Ordenanza de Impuestos Municipales')).toBeInTheDocument();
      });
    });

    it('searches ordinances by keyword', async () => {
      api.get.mockImplementation((url) => {
        if (url.includes('search=tránsito')) {
          return Promise.resolve({
            data: { data: [mockOrdinances[0]] },
          });
        }
        return Promise.resolve({
          data: { data: mockOrdinances },
        });
      });

      render(<OrdenanzasPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Ordenanzas Municipales')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/ordenanza de tránsito/i);
      fireEvent.change(searchInput, { target: { value: 'tránsito' } });

      const searchButton = screen.getByRole('button', { name: /Buscar/i });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('search=tr%C3%A1nsito')
        );
      });
    });

    it('displays ordinance metadata correctly', async () => {
      api.get.mockResolvedValue({
        data: { data: mockOrdinances },
      });

      render(<OrdenanzasPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('ORD-2024-001')).toBeInTheDocument();
      });

      expect(screen.getByText(/Materia:/i)).toBeInTheDocument();
      expect(screen.getByText('Tránsito y Transporte')).toBeInTheDocument();
      expect(screen.getByText(/Fecha de Sanción/i)).toBeInTheDocument();
    });

    it('shows action buttons for ordinances', async () => {
      api.get.mockResolvedValue({
        data: { data: mockOrdinances },
      });

      render(<OrdenanzasPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Ordenanza de Tránsito')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /Ver Texto Completo/i });
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });
});
