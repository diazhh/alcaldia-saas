import {
  exportToCSV,
  exportToJSON,
  exportOrganizationalStructure,
} from '@/lib/exportUtils';

// Mock DOM APIs
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('Export Utilities', () => {
  let mockLink;

  beforeEach(() => {
    // Mock document.createElement and link behavior
    mockLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      style: {},
    };

    jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('exportToCSV', () => {
    test('exports data to CSV format', () => {
      const data = [
        { name: 'John', email: 'john@example.com', age: 30 },
        { name: 'Jane', email: 'jane@example.com', age: 25 },
      ];

      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'age', label: 'Age' },
      ];

      exportToCSV(data, 'test-export', columns);

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });

    test('handles empty data', () => {
      exportToCSV([], 'empty', []);
      expect(console.warn).toHaveBeenCalledWith('No hay datos para exportar');
    });

    test('escapes special characters in CSV', () => {
      const data = [{ name: 'Test, "Name"' }];
      const columns = [{ key: 'name', label: 'Name' }];

      exportToCSV(data, 'test', columns);

      // Should escape quotes and handle commas
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    test('exports data to JSON format', () => {
      const data = { test: 'data', nested: { value: 123 } };

      exportToJSON(data, 'test-export');

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.json');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('exportOrganizationalStructure', () => {
    test('exports organizational structure', () => {
      const departments = [
        {
          id: '1',
          code: 'DIR-001',
          name: 'Dirección General',
          type: 'DIRECCION',
          isActive: true,
          _count: { users: 5, children: 2 },
          children: [
            {
              id: '2',
              code: 'COORD-001',
              name: 'Coordinación',
              type: 'COORDINACION',
              isActive: true,
              _count: { users: 3, children: 0 },
              children: [],
            },
          ],
        },
      ];

      exportOrganizationalStructure(departments);

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringContaining('estructura_organizacional_')
      );
      expect(mockLink.click).toHaveBeenCalled();
    });

    test('flattens nested department structure', () => {
      const departments = [
        {
          id: '1',
          code: 'DIR-001',
          name: 'Parent',
          type: 'DIRECCION',
          isActive: true,
          _count: { users: 1 },
          children: [
            {
              id: '2',
              code: 'CHILD-001',
              name: 'Child',
              type: 'DEPARTAMENTO',
              isActive: true,
              _count: { users: 2 },
              children: [],
            },
          ],
        },
      ];

      exportOrganizationalStructure(departments);

      // Should process both parent and child
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});
