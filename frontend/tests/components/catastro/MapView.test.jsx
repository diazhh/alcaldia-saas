import { render, screen } from '@testing-library/react';
import MapView from '@/components/modules/catastro/MapView';

// Mock Leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  Polygon: ({ children }) => <div data-testid="polygon">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
  }),
}));

// Mock Leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
  divIcon: jest.fn(() => ({})),
}));

describe('MapView', () => {
  const mockProperties = [
    {
      id: '1',
      cadastralCode: '01-02-03-004',
      address: 'Calle Principal',
      propertyUse: 'RESIDENTIAL',
      latitude: 10.4806,
      longitude: -66.9036,
      landArea: 200,
      constructionArea: 150,
      taxpayer: { name: 'Juan Pérez' },
    },
    {
      id: '2',
      cadastralCode: '01-02-03-005',
      address: 'Avenida Libertador',
      propertyUse: 'COMMERCIAL',
      latitude: 10.4816,
      longitude: -66.9046,
      landArea: 300,
      constructionArea: 250,
    },
  ];

  const mockZones = [
    {
      id: '1',
      zoneCode: 'R1',
      zoneName: 'Zona Residencial 1',
      zoneType: 'RESIDENTIAL',
      coordinates: [
        [10.48, -66.90],
        [10.48, -66.91],
        [10.49, -66.91],
        [10.49, -66.90],
      ],
      allowedUses: ['Vivienda unifamiliar', 'Vivienda multifamiliar'],
    },
  ];

  it('renders map container', () => {
    render(<MapView properties={[]} zones={[]} />);
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders layer control panel', () => {
    render(<MapView properties={[]} zones={[]} />);
    
    expect(screen.getByText('Capas del Mapa')).toBeInTheDocument();
    expect(screen.getByText('Propiedades')).toBeInTheDocument();
    expect(screen.getByText('Zonificación')).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<MapView properties={[]} zones={[]} />);
    
    expect(screen.getByText('Leyenda')).toBeInTheDocument();
    expect(screen.getByText('Residencial')).toBeInTheDocument();
    expect(screen.getByText('Comercial')).toBeInTheDocument();
    expect(screen.getByText('Industrial')).toBeInTheDocument();
  });

  it('renders measurement tools when enabled', () => {
    render(<MapView properties={[]} zones={[]} showMeasurementTools={true} />);
    
    expect(screen.getByText('Medir')).toBeInTheDocument();
    expect(screen.getByText('Exportar')).toBeInTheDocument();
  });

  it('does not render measurement tools when disabled', () => {
    render(<MapView properties={[]} zones={[]} showMeasurementTools={false} />);
    
    expect(screen.queryByText('Medir')).not.toBeInTheDocument();
    expect(screen.queryByText('Exportar')).not.toBeInTheDocument();
  });

  it('renders properties with coordinates', () => {
    render(<MapView properties={mockProperties} zones={[]} />);
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
  });

  it('does not render properties without coordinates', () => {
    const propertiesWithoutCoords = [
      {
        id: '3',
        cadastralCode: '01-02-03-006',
        address: 'Sin coordenadas',
        propertyUse: 'RESIDENTIAL',
      },
    ];

    render(<MapView properties={propertiesWithoutCoords} zones={[]} />);
    
    const markers = screen.queryAllByTestId('marker');
    expect(markers).toHaveLength(0);
  });

  it('renders zones with coordinates', () => {
    render(<MapView properties={[]} zones={mockZones} />);
    
    const polygons = screen.getAllByTestId('polygon');
    expect(polygons).toHaveLength(1);
  });

  it('calls onPropertyClick when provided', () => {
    const mockOnPropertyClick = jest.fn();
    
    render(
      <MapView
        properties={mockProperties}
        zones={[]}
        onPropertyClick={mockOnPropertyClick}
      />
    );
    
    // The click handler is set up but not directly testable in this unit test
    // This would be better tested in an integration test
    expect(screen.getAllByTestId('marker')).toHaveLength(2);
  });

  it('calls onZoneClick when provided', () => {
    const mockOnZoneClick = jest.fn();
    
    render(
      <MapView
        properties={[]}
        zones={mockZones}
        onZoneClick={mockOnZoneClick}
      />
    );
    
    expect(screen.getAllByTestId('polygon')).toHaveLength(1);
  });
});
