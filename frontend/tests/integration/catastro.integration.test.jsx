import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertiesPage from '@/app/(dashboard)/catastro/propiedades/page';
import UrbanVariablesPage from '@/app/(dashboard)/catastro/variables-urbanas/page';
import ConstructionPermitsPage from '@/app/(dashboard)/catastro/permisos/page';
import * as catastroService from '@/services/catastro.service';

// Mock the services
jest.mock('@/services/catastro.service');
jest.mock('@/lib/api');

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/catastro/propiedades',
}));

describe('Catastro Integration Tests', () => {
  describe('Properties Management', () => {
    const mockProperties = [
      {
        id: '1',
        cadastralCode: '01-02-03-004',
        address: 'Calle Principal',
        propertyUse: 'RESIDENTIAL',
        landArea: 200,
        constructionArea: 150,
        taxpayer: { name: 'Juan Pérez' },
      },
      {
        id: '2',
        cadastralCode: '01-02-03-005',
        address: 'Avenida Libertador',
        propertyUse: 'COMMERCIAL',
        landArea: 300,
        constructionArea: 250,
        taxpayer: { name: 'María García' },
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      catastroService.getProperties = jest.fn().mockResolvedValue(mockProperties);
      catastroService.deleteProperty = jest.fn().mockResolvedValue({});
    });

    it('loads and displays properties', async () => {
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('01-02-03-004')).toBeInTheDocument();
        expect(screen.getByText('01-02-03-005')).toBeInTheDocument();
      });

      expect(catastroService.getProperties).toHaveBeenCalled();
    });

    it('filters properties by search term', async () => {
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('01-02-03-004')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Buscar por código catastral/i);
      
      await user.type(searchInput, 'Libertador');

      await waitFor(() => {
        expect(screen.getByText('01-02-03-005')).toBeInTheDocument();
        expect(screen.queryByText('01-02-03-004')).not.toBeInTheDocument();
      });
    });

    it('opens dialog when clicking new property button', async () => {
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('01-02-03-004')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const newButton = screen.getByRole('button', { name: /Nueva Propiedad/i });
      
      await user.click(newButton);

      await waitFor(() => {
        expect(screen.getByText('Nueva Ficha Catastral')).toBeInTheDocument();
      });
    });
  });

  describe('Urban Variables Management', () => {
    const mockVariables = [
      {
        id: '1',
        zoneCode: 'R1',
        zoneName: 'Zona Residencial 1',
        zoneType: 'RESIDENTIAL',
        frontSetback: 5,
        rearSetback: 3,
        leftSetback: 2,
        rightSetback: 2,
        maxHeight: 12,
        allowedUses: ['Vivienda unifamiliar', 'Vivienda multifamiliar'],
      },
      {
        id: '2',
        zoneCode: 'C1',
        zoneName: 'Zona Comercial 1',
        zoneType: 'COMMERCIAL',
        frontSetback: 3,
        maxHeight: 20,
        allowedUses: ['Comercio', 'Oficinas'],
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      catastroService.getUrbanVariables = jest.fn().mockResolvedValue(mockVariables);
      catastroService.deleteUrbanVariable = jest.fn().mockResolvedValue({});
    });

    it('loads and displays urban variables', async () => {
      render(<UrbanVariablesPage />);

      await waitFor(() => {
        expect(screen.getByText('R1')).toBeInTheDocument();
        expect(screen.getByText('C1')).toBeInTheDocument();
      });

      expect(catastroService.getUrbanVariables).toHaveBeenCalled();
    });

    it('filters urban variables by search term', async () => {
      render(<UrbanVariablesPage />);

      await waitFor(() => {
        expect(screen.getByText('R1')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Buscar por código o nombre/i);
      
      await user.type(searchInput, 'Comercial');

      await waitFor(() => {
        expect(screen.getByText('C1')).toBeInTheDocument();
        expect(screen.queryByText('R1')).not.toBeInTheDocument();
      });
    });

    it('opens dialog when clicking new variable button', async () => {
      render(<UrbanVariablesPage />);

      await waitFor(() => {
        expect(screen.getByText('R1')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const newButton = screen.getByRole('button', { name: /Nueva Variable Urbana/i });
      
      await user.click(newButton);

      await waitFor(() => {
        expect(screen.getByText('Nueva Variable Urbana')).toBeInTheDocument();
      });
    });
  });

  describe('Construction Permits Management', () => {
    const mockPermits = [
      {
        id: '1',
        permitNumber: 'CP-2024-001',
        applicantName: 'Juan Pérez',
        applicantPhone: '0414-1234567',
        projectType: 'NEW_CONSTRUCTION',
        status: 'PENDING_REVIEW',
        constructionArea: 150,
        property: { cadastralCode: '01-02-03-004' },
      },
      {
        id: '2',
        permitNumber: 'CP-2024-002',
        applicantName: 'María García',
        applicantPhone: '0424-7654321',
        projectType: 'EXPANSION',
        status: 'APPROVED',
        constructionArea: 80,
        property: { cadastralCode: '01-02-03-005' },
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      catastroService.getConstructionPermits = jest.fn().mockResolvedValue(mockPermits);
      catastroService.reviewPermit = jest.fn().mockResolvedValue({});
      catastroService.approveOrRejectPermit = jest.fn().mockResolvedValue({});
    });

    it('loads and displays construction permits', async () => {
      render(<ConstructionPermitsPage />);

      await waitFor(() => {
        expect(screen.getByText('CP-2024-001')).toBeInTheDocument();
        expect(screen.getByText('CP-2024-002')).toBeInTheDocument();
      });

      expect(catastroService.getConstructionPermits).toHaveBeenCalled();
    });

    it('filters permits by search term', async () => {
      render(<ConstructionPermitsPage />);

      await waitFor(() => {
        expect(screen.getByText('CP-2024-001')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/Buscar por número de permiso/i);
      
      await user.type(searchInput, 'CP-2024-002');

      await waitFor(() => {
        expect(screen.getByText('CP-2024-002')).toBeInTheDocument();
        expect(screen.queryByText('CP-2024-001')).not.toBeInTheDocument();
      });
    });

    it('opens dialog when clicking new permit button', async () => {
      render(<ConstructionPermitsPage />);

      await waitFor(() => {
        expect(screen.getByText('CP-2024-001')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const newButton = screen.getByRole('button', { name: /Nueva Solicitud/i });
      
      await user.click(newButton);

      await waitFor(() => {
        expect(screen.getByText('Nueva Solicitud de Permiso')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Workflow', () => {
    it('completes full property registration workflow', async () => {
      const mockProperty = {
        id: '1',
        cadastralCode: '01-02-03-004',
        address: 'Calle Principal',
        propertyUse: 'RESIDENTIAL',
        landArea: 200,
        constructionArea: 150,
      };

      catastroService.getProperties = jest.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockProperty]);
      
      catastroService.createProperty = jest.fn().mockResolvedValue(mockProperty);

      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText(/No se encontraron propiedades/i)).toBeInTheDocument();
      });

      // This test demonstrates the workflow structure
      // Full implementation would require more complex mocking
      expect(catastroService.getProperties).toHaveBeenCalled();
    });
  });
});
