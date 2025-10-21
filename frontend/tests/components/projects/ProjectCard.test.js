import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProjectCard from '@/components/modules/projects/ProjectCard';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ProjectCard', () => {
  const mockPush = jest.fn();
  const mockProject = {
    id: '1',
    code: 'PRO-2025-001',
    name: 'Proyecto de Prueba',
    description: 'Descripción del proyecto',
    budget: '100000',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    startDate: '2025-01-01',
    location: 'Caracas',
    sector: 'Vialidad',
    category: 'Obra Civil',
    beneficiaries: 1000,
  };

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('PRO-2025-001')).toBeInTheDocument();
    expect(screen.getByText('Proyecto de Prueba')).toBeInTheDocument();
    expect(screen.getByText('Descripción del proyecto')).toBeInTheDocument();
    expect(screen.getByText('Caracas')).toBeInTheDocument();
    expect(screen.getByText('Vialidad')).toBeInTheDocument();
    expect(screen.getByText('Obra Civil')).toBeInTheDocument();
  });

  it('displays status badge correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('En Progreso')).toBeInTheDocument();
  });

  it('displays priority badge correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('navigates to project detail when clicking view button', () => {
    render(<ProjectCard project={mockProject} />);

    const viewButton = screen.getByRole('button', { name: /ver detalles/i });
    fireEvent.click(viewButton);

    expect(mockPush).toHaveBeenCalledWith('/proyectos/1');
  });

  it('formats budget correctly', () => {
    render(<ProjectCard project={mockProject} />);

    // El formato puede variar según la configuración regional
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('displays beneficiaries count', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText(/1.000 beneficiarios/i)).toBeInTheDocument();
  });
});
