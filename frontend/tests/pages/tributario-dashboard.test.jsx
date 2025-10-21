import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TributarioDashboardPage from '@/app/(dashboard)/tributario/dashboard/page';
import axios from 'axios';

jest.mock('axios');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

describe('TributarioDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el dashboard con indicadores', async () => {
    render(<TributarioDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Tributario')).toBeInTheDocument();
      expect(screen.getByText('Recaudación del Mes')).toBeInTheDocument();
      expect(screen.getByText('Contribuyentes Activos')).toBeInTheDocument();
      expect(screen.getByText('Morosidad Total')).toBeInTheDocument();
      expect(screen.getByText('Solvencias Emitidas')).toBeInTheDocument();
    });
  });

  it('debe mostrar las pestañas de gráficos', async () => {
    render(<TributarioDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tab-collection')).toBeInTheDocument();
      expect(screen.getByTestId('tab-distribution')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trends')).toBeInTheDocument();
    });
  });

  it('debe mostrar alertas importantes', async () => {
    render(<TributarioDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Alertas Importantes')).toBeInTheDocument();
      expect(screen.getByText(/Vencimiento de Patentes/i)).toBeInTheDocument();
      expect(screen.getByText(/Morosos Críticos/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar top 5 contribuyentes', async () => {
    render(<TributarioDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Top 5 Contribuyentes')).toBeInTheDocument();
      expect(screen.getByText('Empresa ABC, C.A.')).toBeInTheDocument();
    });
  });

  it('debe formatear correctamente las cantidades monetarias', async () => {
    render(<TributarioDashboardPage />);

    await waitFor(() => {
      const amounts = screen.getAllByText(/Bs/i);
      expect(amounts.length).toBeGreaterThan(0);
    });
  });
});
