import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FleetCharts from '@/components/modules/fleet/FleetCharts';
import {
  getTripStatistics,
  getFuelStatistics,
  getMaintenanceStatistics,
} from '@/services/fleet.service';

// Mock services
jest.mock('@/services/fleet.service');

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
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

describe('FleetCharts', () => {
  const mockTripStats = {
    byMonth: [
      { month: 'Ene', trips: 10, distance: 500 },
      { month: 'Feb', trips: 15, distance: 750 },
      { month: 'Mar', trips: 12, distance: 600 },
    ],
  };

  const mockFuelStats = {
    byMonth: [
      { month: 'Ene', liters: 200, fuelCost: 5000, maintenanceCost: 2000 },
      { month: 'Feb', liters: 250, fuelCost: 6250, maintenanceCost: 1500 },
      { month: 'Mar', liters: 220, fuelCost: 5500, maintenanceCost: 3000 },
    ],
  };

  const mockMaintenanceStats = {
    byType: [
      { name: 'PREVENTIVE', count: 15 },
      { name: 'CORRECTIVE', count: 8 },
      { name: 'INSPECTION', count: 5 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getTripStatistics.mockResolvedValue(mockTripStats);
    getFuelStatistics.mockResolvedValue(mockFuelStats);
    getMaintenanceStatistics.mockResolvedValue(mockMaintenanceStats);
  });

  it('renders all chart sections', async () => {
    render(<FleetCharts />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Viajes Mensuales')).toBeInTheDocument();
      expect(screen.getByText('Consumo de Combustible')).toBeInTheDocument();
      expect(screen.getByText('Tipos de Mantenimiento')).toBeInTheDocument();
      expect(screen.getByText('Costos Operativos Mensuales')).toBeInTheDocument();
    });
  });

  it('fetches statistics data on mount', async () => {
    render(<FleetCharts />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getTripStatistics).toHaveBeenCalledWith({
        period: 'year',
        groupBy: 'month',
      });
      expect(getFuelStatistics).toHaveBeenCalledWith({
        period: 'year',
        groupBy: 'month',
      });
      expect(getMaintenanceStatistics).toHaveBeenCalledWith({
        period: 'year',
        groupBy: 'type',
      });
    });
  });

  it('renders line chart for trips', async () => {
    render(<FleetCharts />, { wrapper: createWrapper() });

    await waitFor(() => {
      const lineCharts = screen.getAllByTestId('line-chart');
      expect(lineCharts.length).toBeGreaterThan(0);
    });
  });

  it('renders bar charts for fuel and costs', async () => {
    render(<FleetCharts />, { wrapper: createWrapper() });

    await waitFor(() => {
      const barCharts = screen.getAllByTestId('bar-chart');
      expect(barCharts.length).toBeGreaterThan(0);
    });
  });

  it('renders pie chart for maintenance types', async () => {
    render(<FleetCharts />, { wrapper: createWrapper() });

    await waitFor(() => {
      const pieCharts = screen.getAllByTestId('pie-chart');
      expect(pieCharts.length).toBeGreaterThan(0);
    });
  });

  it('handles empty data gracefully', async () => {
    getTripStatistics.mockResolvedValue({ byMonth: [] });
    getFuelStatistics.mockResolvedValue({ byMonth: [] });
    getMaintenanceStatistics.mockResolvedValue({ byType: [] });

    render(<FleetCharts />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Viajes Mensuales')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    getTripStatistics.mockRejectedValue(new Error('API Error'));
    getFuelStatistics.mockRejectedValue(new Error('API Error'));
    getMaintenanceStatistics.mockRejectedValue(new Error('API Error'));

    render(<FleetCharts />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Viajes Mensuales')).toBeInTheDocument();
    });
  });
});
