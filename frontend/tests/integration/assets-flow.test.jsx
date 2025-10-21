/**
 * Integration tests for Assets Management Module
 * Tests the complete flow of asset management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import AssetsListPage from '@/app/(dashboard)/bienes/activos/page';
import { getAssets, createAsset, deleteAsset } from '@/services/assets.service';

jest.mock('@/services/assets.service');
jest.mock('sonner');

describe('Assets Management Flow', () => {
  const mockAssets = [
    {
      id: '1',
      code: 'BM-2025-0001',
      name: 'Computadora Dell',
      type: 'COMPUTER',
      status: 'ACTIVE',
      currentValue: 1000,
      location: 'Oficina Principal',
      custodian: { name: 'Juan Pérez' },
    },
    {
      id: '2',
      code: 'BM-2025-0002',
      name: 'Escritorio Ejecutivo',
      type: 'FURNITURE',
      status: 'IN_USE',
      currentValue: 500,
      location: 'Dirección',
      custodian: { name: 'María García' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getAssets.mockResolvedValue({
      data: mockAssets,
      pagination: { total: 2, totalPages: 1 },
    });
  });

  it('loads and displays assets list', async () => {
    render(<AssetsListPage />);

    await waitFor(() => {
      expect(screen.getByText('BM-2025-0001')).toBeInTheDocument();
      expect(screen.getByText('Computadora Dell')).toBeInTheDocument();
      expect(screen.getByText('BM-2025-0002')).toBeInTheDocument();
      expect(screen.getByText('Escritorio Ejecutivo')).toBeInTheDocument();
    });
  });

  it('filters assets by type', async () => {
    render(<AssetsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Computadora Dell')).toBeInTheDocument();
    });

    // Simulate filter change
    const typeFilter = screen.getByRole('combobox', { name: /tipo de bien/i });
    fireEvent.change(typeFilter, { target: { value: 'COMPUTER' } });

    await waitFor(() => {
      expect(getAssets).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'COMPUTER' })
      );
    });
  });

  it('searches assets by term', async () => {
    render(<AssetsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Computadora Dell')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Dell' } });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(getAssets).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Dell' })
      );
    });
  });

  it('deletes an asset with confirmation', async () => {
    global.confirm = jest.fn(() => true);
    deleteAsset.mockResolvedValue({});

    render(<AssetsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Computadora Dell')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /trash/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteAsset).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Bien eliminado exitosamente');
    });
  });

  it('cancels delete when user declines confirmation', async () => {
    global.confirm = jest.fn(() => false);

    render(<AssetsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Computadora Dell')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /trash/i });
    fireEvent.click(deleteButtons[0]);

    expect(deleteAsset).not.toHaveBeenCalled();
  });

  it('handles pagination correctly', async () => {
    getAssets.mockResolvedValue({
      data: mockAssets,
      pagination: { total: 20, totalPages: 2 },
    });

    render(<AssetsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Mostrando 2 de 20 bienes')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(getAssets).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('shows empty state when no assets found', async () => {
    getAssets.mockResolvedValue({
      data: [],
      pagination: { total: 0, totalPages: 0 },
    });

    render(<AssetsListPage />);

    await waitFor(() => {
      expect(screen.getByText('No se encontraron bienes')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    getAssets.mockRejectedValue(new Error('Network error'));

    render(<AssetsListPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar bienes');
    });
  });
});
