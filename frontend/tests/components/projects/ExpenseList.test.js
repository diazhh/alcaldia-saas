import { render, screen } from '@testing-library/react';
import ExpenseList from '@/components/modules/projects/ExpenseList';

describe('ExpenseList', () => {
  const mockExpenses = [
    {
      id: '1',
      concept: 'Materiales de construcción',
      amount: '50000',
      date: '2025-01-15',
      category: 'Materiales',
      invoice: 'INV-001',
    },
    {
      id: '2',
      concept: 'Mano de obra',
      amount: '30000',
      date: '2025-01-20',
      category: 'Personal',
      invoice: null,
    },
  ];

  const mockStats = {
    total: 80000,
    count: 2,
    byCategory: [
      { category: 'Materiales', total: 50000, count: 1 },
      { category: 'Personal', total: 30000, count: 1 },
    ],
  };

  it('renders empty state when no expenses', () => {
    render(<ExpenseList expenses={[]} />);

    expect(screen.getByText(/no hay gastos registrados/i)).toBeInTheDocument();
  });

  it('renders all expenses correctly', () => {
    render(<ExpenseList expenses={mockExpenses} />);

    expect(screen.getByText('Materiales de construcción')).toBeInTheDocument();
    expect(screen.getByText('Mano de obra')).toBeInTheDocument();
    expect(screen.getByText('Materiales')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('displays invoice numbers correctly', () => {
    render(<ExpenseList expenses={mockExpenses} />);

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders statistics when provided', () => {
    render(<ExpenseList expenses={mockExpenses} stats={mockStats} />);

    expect(screen.getByText('Total Gastado')).toBeInTheDocument();
    expect(screen.getByText('Número de Gastos')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays category breakdown in stats', () => {
    render(<ExpenseList expenses={mockExpenses} stats={mockStats} />);

    expect(screen.getByText('Categorías')).toBeInTheDocument();
    // Las categorías se muestran en el resumen
    const materialesElements = screen.getAllByText('Materiales');
    expect(materialesElements.length).toBeGreaterThan(0);
  });

  it('formats dates correctly', () => {
    render(<ExpenseList expenses={mockExpenses} />);

    // Las fechas se formatean en formato dd/MM/yyyy
    expect(screen.getByText(/15\/01\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/20\/01\/2025/)).toBeInTheDocument();
  });
});
