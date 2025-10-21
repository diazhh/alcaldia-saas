import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeeTable from '@/components/modules/hr/EmployeeTable';

describe('EmployeeTable', () => {
  const mockEmployees = [
    {
      id: 'emp-1',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@test.com',
      employeeNumber: 'EMP-2024-0001',
      idNumber: 'V-12345678',
      status: 'ACTIVE',
      position: { name: 'Analista' },
      department: { name: 'TI' },
    },
    {
      id: 'emp-2',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@test.com',
      employeeNumber: 'EMP-2024-0002',
      idNumber: 'V-87654321',
      status: 'INACTIVE',
      position: { name: 'Coordinador' },
      department: { name: 'RRHH' },
    },
  ];

  const mockPagination = {
    total: 2,
    page: 1,
    limit: 20,
    pages: 1,
  };

  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar la tabla con empleados', () => {
    render(
      <EmployeeTable
        data={mockEmployees}
        pagination={mockPagination}
        isLoading={false}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María González')).toBeInTheDocument();
    expect(screen.getByText('EMP-2024-0001')).toBeInTheDocument();
    expect(screen.getByText('EMP-2024-0002')).toBeInTheDocument();
  });

  it('debe mostrar el estado correcto de cada empleado', () => {
    render(
      <EmployeeTable
        data={mockEmployees}
        pagination={mockPagination}
        isLoading={false}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('debe mostrar skeleton cuando está cargando', () => {
    const { container } = render(
      <EmployeeTable
        data={[]}
        pagination={mockPagination}
        isLoading={true}
        onPageChange={mockOnPageChange}
      />
    );

    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe mostrar mensaje cuando no hay empleados', () => {
    render(
      <EmployeeTable
        data={[]}
        pagination={mockPagination}
        isLoading={false}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('No se encontraron empleados')).toBeInTheDocument();
  });

  it('debe mostrar información de paginación cuando hay múltiples páginas', () => {
    const paginationMultiPage = {
      total: 50,
      page: 1,
      limit: 20,
      pages: 3,
    };

    render(
      <EmployeeTable
        data={mockEmployees}
        pagination={paginationMultiPage}
        isLoading={false}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
    expect(screen.getByText(/50 empleados/)).toBeInTheDocument();
  });

  it('debe llamar onPageChange cuando se hace clic en siguiente', () => {
    const paginationMultiPage = {
      total: 50,
      page: 1,
      limit: 20,
      pages: 3,
    };

    render(
      <EmployeeTable
        data={mockEmployees}
        pagination={paginationMultiPage}
        isLoading={false}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('debe deshabilitar el botón anterior en la primera página', () => {
    const paginationMultiPage = {
      total: 50,
      page: 1,
      limit: 20,
      pages: 3,
    };

    render(
      <EmployeeTable
        data={mockEmployees}
        pagination={paginationMultiPage}
        isLoading={false}
        onPageChange={mockOnPageChange}
      />
    );

    const prevButton = screen.getByText('Anterior');
    expect(prevButton).toBeDisabled();
  });

  it('debe mostrar cargo y departamento de cada empleado', () => {
    render(
      <EmployeeTable
        data={mockEmployees}
        pagination={mockPagination}
        isLoading={false}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Analista')).toBeInTheDocument();
    expect(screen.getByText('Coordinador')).toBeInTheDocument();
    expect(screen.getByText('TI')).toBeInTheDocument();
    expect(screen.getByText('RRHH')).toBeInTheDocument();
  });
});
