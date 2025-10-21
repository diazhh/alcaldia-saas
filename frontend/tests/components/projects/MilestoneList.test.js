import { render, screen, fireEvent } from '@testing-library/react';
import MilestoneList from '@/components/modules/projects/MilestoneList';

describe('MilestoneList', () => {
  const mockMilestones = [
    {
      id: '1',
      name: 'Hito 1',
      description: 'Descripción del hito 1',
      dueDate: '2025-12-31',
      progress: 50,
      status: 'IN_PROGRESS',
    },
    {
      id: '2',
      name: 'Hito 2',
      description: 'Descripción del hito 2',
      dueDate: '2025-11-30',
      completedAt: '2025-11-25',
      progress: 100,
      status: 'COMPLETED',
    },
  ];

  it('renders empty state when no milestones', () => {
    render(<MilestoneList milestones={[]} />);

    expect(screen.getByText(/no hay hitos registrados/i)).toBeInTheDocument();
  });

  it('renders all milestones correctly', () => {
    render(<MilestoneList milestones={mockMilestones} />);

    expect(screen.getByText('Hito 1')).toBeInTheDocument();
    expect(screen.getByText('Hito 2')).toBeInTheDocument();
    expect(screen.getByText('Descripción del hito 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción del hito 2')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(<MilestoneList milestones={mockMilestones} />);

    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('displays progress bars with correct values', () => {
    render(<MilestoneList milestones={mockMilestones} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('calls onUpdateProgress when clicking +25% button', () => {
    const mockUpdateProgress = jest.fn();
    render(<MilestoneList milestones={mockMilestones} onUpdateProgress={mockUpdateProgress} />);

    const buttons = screen.getAllByText('+25%');
    fireEvent.click(buttons[0]);

    expect(mockUpdateProgress).toHaveBeenCalledWith('1', 75);
  });

  it('shows complete button when progress is 100%', () => {
    const milestones = [
      {
        id: '1',
        name: 'Hito Completo',
        dueDate: '2025-12-31',
        progress: 100,
        status: 'IN_PROGRESS',
      },
    ];

    render(<MilestoneList milestones={milestones} onUpdateProgress={jest.fn()} />);

    expect(screen.getByText(/marcar como completado/i)).toBeInTheDocument();
  });

  it('does not show action buttons for completed milestones', () => {
    const milestones = [
      {
        id: '1',
        name: 'Hito Completado',
        dueDate: '2025-12-31',
        completedAt: '2025-12-30',
        progress: 100,
        status: 'COMPLETED',
      },
    ];

    render(<MilestoneList milestones={milestones} onUpdateProgress={jest.fn()} />);

    expect(screen.queryByText('+25%')).not.toBeInTheDocument();
  });
});
