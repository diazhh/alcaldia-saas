import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutopagoPage from '@/app/(public)/autopago/page';
import axios from 'axios';

jest.mock('axios');

describe('AutopagoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000';
  });

  it('debe renderizar el formulario de consulta', () => {
    render(<AutopagoPage />);

    expect(screen.getByText('Portal de Autopago Municipal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /consultar deudas/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ej: V-12345678/i)).toBeInTheDocument();
  });

  it('debe consultar deudas por RIF/CI', async () => {
    const mockDebts = {
      taxpayer: { name: 'Juan Pérez' },
      totalDebt: 500000,
      bills: [
        {
          id: '1',
          billNumber: 'FACT-001',
          concept: 'Impuesto sobre Inmuebles',
          amount: 500000,
          dueDate: '2024-06-30',
          status: 'PENDING',
        },
      ],
    };

    axios.get.mockResolvedValue({ data: mockDebts });

    const { container } = render(<AutopagoPage />);

    const input = screen.getByPlaceholderText(/Ej: V-12345678/i);
    fireEvent.change(input, { target: { value: 'V-12345678' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(screen.getByText('Estado de Cuenta')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay deudas', async () => {
    const mockDebts = {
      taxpayer: { name: 'Juan Pérez' },
      totalDebt: 0,
      bills: [],
    };

    axios.get.mockResolvedValue({ data: mockDebts });

    const { container } = render(<AutopagoPage />);

    const input = screen.getByPlaceholderText(/Ej: V-12345678/i);
    fireEvent.change(input, { target: { value: 'V-12345678' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('¡Estás al día!')).toBeInTheDocument();
    });
  });

  it('debe generar planilla de pago', async () => {
    const mockDebts = {
      taxpayer: { name: 'Juan Pérez' },
      totalDebt: 500000,
      bills: [
        {
          id: '1',
          billNumber: 'FACT-001',
          concept: 'Impuesto sobre Inmuebles',
          amount: 500000,
          dueDate: '2024-06-30',
          status: 'PENDING',
        },
      ],
    };

    axios.get.mockResolvedValue({ data: mockDebts });
    axios.post.mockResolvedValue({ data: { paymentCode: 'PAY-123456' } });

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = render(<AutopagoPage />);

    const input = screen.getByPlaceholderText(/Ej: V-12345678/i);
    fireEvent.change(input, { target: { value: 'V-12345678' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generar planilla de pago/i })).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generar planilla de pago/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });

  it('debe manejar errores en la consulta', async () => {
    axios.get.mockRejectedValue({
      response: { data: { message: 'Contribuyente no encontrado' } },
    });

    const { container } = render(<AutopagoPage />);

    const input = screen.getByPlaceholderText(/Ej: V-12345678/i);
    fireEvent.change(input, { target: { value: 'V-99999999' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Contribuyente no encontrado')).toBeInTheDocument();
    });
  });

  it('debe mostrar métodos de pago disponibles después de consultar', async () => {
    const mockDebts = {
      taxpayer: { name: 'Juan Pérez' },
      totalDebt: 500000,
      bills: [
        {
          id: '1',
          billNumber: 'FACT-001',
          concept: 'Impuesto sobre Inmuebles',
          amount: 500000,
          dueDate: '2024-06-30',
          status: 'PENDING',
        },
      ],
    };

    axios.get.mockResolvedValue({ data: mockDebts });

    const { container } = render(<AutopagoPage />);

    const input = screen.getByPlaceholderText(/Ej: V-12345678/i);
    fireEvent.change(input, { target: { value: 'V-12345678' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Métodos de Pago Disponibles')).toBeInTheDocument();
      expect(screen.getByText('Pago Móvil')).toBeInTheDocument();
    });
  });
});
