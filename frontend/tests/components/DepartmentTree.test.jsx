import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DepartmentTree from '@/components/modules/departments/DepartmentTree';

describe('DepartmentTree Component', () => {
  const mockDepartments = [
    {
      id: '1',
      code: 'DIR-001',
      name: 'Dirección General',
      type: 'DIRECCION',
      isActive: true,
      _count: { users: 5 },
      children: [
        {
          id: '2',
          code: 'COORD-001',
          name: 'Coordinación Administrativa',
          type: 'COORDINACION',
          isActive: true,
          _count: { users: 3 },
          children: [],
        },
      ],
    },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  test('renders department tree correctly', () => {
    render(
      <DepartmentTree
        departments={mockDepartments}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Dirección General')).toBeInTheDocument();
    expect(screen.getByText('(DIR-001)')).toBeInTheDocument();
  });

  test('shows expand/collapse controls', () => {
    render(
      <DepartmentTree
        departments={mockDepartments}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Expandir todo')).toBeInTheDocument();
    expect(screen.getByText('Colapsar todo')).toBeInTheDocument();
  });

  test('calls onSelect when department is clicked', () => {
    render(
      <DepartmentTree
        departments={mockDepartments}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    const departmentNode = screen.getByText('Dirección General').closest('div');
    fireEvent.click(departmentNode);

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        name: 'Dirección General',
      })
    );
  });

  test('displays employee count badge', () => {
    render(
      <DepartmentTree
        departments={mockDepartments}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('shows empty state when no departments', () => {
    render(
      <DepartmentTree
        departments={[]}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('No hay departamentos para mostrar')).toBeInTheDocument();
  });

  test('highlights selected department', () => {
    render(
      <DepartmentTree
        departments={mockDepartments}
        selectedId="1"
        onSelect={mockOnSelect}
      />
    );

    const selectedNode = screen.getByText('Dirección General').closest('div');
    expect(selectedNode).toHaveClass('bg-accent');
  });

  test('displays inactive badge for inactive departments', () => {
    const inactiveDepartments = [
      {
        ...mockDepartments[0],
        isActive: false,
      },
    ];

    render(
      <DepartmentTree
        departments={inactiveDepartments}
        selectedId={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });
});
