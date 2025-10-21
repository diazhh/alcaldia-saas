import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeeForm from '@/components/modules/hr/EmployeeForm';

describe('EmployeeForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el formulario con todos los tabs', () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        submitLabel="Guardar"
      />
    );

    expect(screen.getByText('Datos Personales')).toBeInTheDocument();
    expect(screen.getByText('Datos Laborales')).toBeInTheDocument();
    expect(screen.getByText('Datos Académicos')).toBeInTheDocument();
    expect(screen.getByText('Datos Bancarios')).toBeInTheDocument();
  });

  it('debe mostrar campos requeridos en datos personales', () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        submitLabel="Guardar"
      />
    );

    expect(screen.getByLabelText(/Nombre \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cédula \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email \*/)).toBeInTheDocument();
  });

  it('debe validar campos requeridos al enviar', async () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        submitLabel="Guardar"
      />
    );

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('debe llenar y enviar el formulario correctamente', async () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        submitLabel="Guardar"
      />
    );

    // Llenar campos requeridos
    const firstNameInput = screen.getByLabelText(/Nombre \*/);
    const lastNameInput = screen.getByLabelText(/Apellido \*/);
    const idNumberInput = screen.getByLabelText(/Cédula \*/);
    const emailInput = screen.getByLabelText(/Email \*/);

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
    fireEvent.change(idNumberInput, { target: { value: 'V-12345678' } });
    fireEvent.change(emailInput, { target: { value: 'juan.perez@test.com' } });

    // Cambiar a tab de datos laborales
    const laboralTab = screen.getByText('Datos Laborales');
    fireEvent.click(laboralTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Cargo \*/)).toBeInTheDocument();
    });

    // Llenar campos laborales requeridos
    const hireDateInput = screen.getByLabelText(/Fecha de Ingreso \*/);
    const salaryInput = screen.getByLabelText(/Salario Base \*/);

    fireEvent.change(hireDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(salaryInput, { target: { value: '500' } });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('debe deshabilitar el botón cuando está enviando', () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        isSubmitting={true}
        submitLabel="Guardar"
      />
    );

    const submitButton = screen.getByText('Guardar');
    expect(submitButton).toBeDisabled();
  });

  it('debe cargar datos iniciales cuando se proporcionan', () => {
    const initialData = {
      firstName: 'María',
      lastName: 'González',
      idNumber: 'V-87654321',
      email: 'maria.gonzalez@test.com',
    };

    render(
      <EmployeeForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        submitLabel="Actualizar"
      />
    );

    expect(screen.getByDisplayValue('María')).toBeInTheDocument();
    expect(screen.getByDisplayValue('González')).toBeInTheDocument();
    expect(screen.getByDisplayValue('V-87654321')).toBeInTheDocument();
    expect(screen.getByDisplayValue('maria.gonzalez@test.com')).toBeInTheDocument();
  });

  it('debe mostrar el botón cancelar', () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        submitLabel="Guardar"
      />
    );

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('debe cambiar entre tabs correctamente', async () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        submitLabel="Guardar"
      />
    );

    // Verificar que está en tab de datos personales
    expect(screen.getByLabelText(/Nombre \*/)).toBeInTheDocument();

    // Cambiar a datos académicos
    const academicoTab = screen.getByText('Datos Académicos');
    fireEvent.click(academicoTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nivel Educativo/)).toBeInTheDocument();
    });

    // Cambiar a datos bancarios
    const bancarioTab = screen.getByText('Datos Bancarios');
    fireEvent.click(bancarioTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Banco/)).toBeInTheDocument();
    });
  });
});
