/**
 * Tests unitarios para funciones auxiliares
 */
import {
  sanitizeObject,
  generateSlug,
  isValidEmail,
  generateRandomCode,
  formatDate,
  paginate,
  paginationMeta,
} from '../../src/shared/utils/helpers.js';

describe('Helper Functions', () => {
  describe('sanitizeObject', () => {
    it('debe eliminar el campo password por defecto', () => {
      const obj = {
        id: '1',
        email: 'test@example.com',
        password: 'secret123',
        name: 'John Doe',
      };

      const result = sanitizeObject(obj);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('name', 'John Doe');
    });

    it('debe eliminar campos personalizados', () => {
      const obj = {
        id: '1',
        email: 'test@example.com',
        secret: 'confidential',
        apiKey: 'key123',
      };

      const result = sanitizeObject(obj, ['secret', 'apiKey']);

      expect(result).not.toHaveProperty('secret');
      expect(result).not.toHaveProperty('apiKey');
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('no debe modificar el objeto original', () => {
      const obj = {
        id: '1',
        password: 'secret123',
      };

      const result = sanitizeObject(obj);

      expect(obj).toHaveProperty('password', 'secret123');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('generateSlug', () => {
    it('debe convertir texto a slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Proyecto Municipal 2024')).toBe('proyecto-municipal-2024');
    });

    it('debe eliminar caracteres especiales', () => {
      expect(generateSlug('Test@#$%^&*()')).toBe('test');
      expect(generateSlug('Hola! ¿Cómo estás?')).toBe('hola-cmo-ests');
    });

    it('debe manejar múltiples espacios', () => {
      expect(generateSlug('Multiple   Spaces   Here')).toBe('multiple-spaces-here');
    });

    it('debe eliminar guiones al inicio y final', () => {
      expect(generateSlug('  -test-  ')).toBe('test');
    });
  });

  describe('isValidEmail', () => {
    it('debe validar emails correctos', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.ve')).toBe(true);
      expect(isValidEmail('admin+test@municipal.gob.ve')).toBe(true);
    });

    it('debe rechazar emails inválidos', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('generateRandomCode', () => {
    it('debe generar código de longitud por defecto (6)', () => {
      const code = generateRandomCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('debe generar código de longitud personalizada', () => {
      const code = generateRandomCode(10);
      expect(code).toHaveLength(10);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('debe generar códigos diferentes', () => {
      const code1 = generateRandomCode();
      const code2 = generateRandomCode();
      // Es extremadamente improbable que sean iguales
      expect(code1).not.toBe(code2);
    });
  });

  describe('formatDate', () => {
    it('debe formatear fecha correctamente', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('debe manejar diferentes formatos de entrada', () => {
      const formatted1 = formatDate('2024-12-25');
      const formatted2 = formatDate(new Date('2024-12-25'));
      expect(formatted1).toBe('2024-12-25');
      expect(formatted2).toBe('2024-12-25');
    });
  });

  describe('paginate', () => {
    it('debe calcular skip y take correctamente para la primera página', () => {
      const result = paginate(1, 10);
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('debe calcular skip y take correctamente para páginas subsecuentes', () => {
      const result1 = paginate(2, 10);
      expect(result1).toEqual({ skip: 10, take: 10 });

      const result2 = paginate(3, 20);
      expect(result2).toEqual({ skip: 40, take: 20 });
    });

    it('debe usar valores por defecto', () => {
      const result = paginate();
      expect(result).toEqual({ skip: 0, take: 10 });
    });
  });

  describe('paginationMeta', () => {
    it('debe calcular metadata de paginación correctamente', () => {
      const meta = paginationMeta(100, 1, 10);
      expect(meta).toEqual({
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('debe indicar correctamente hasNextPage y hasPrevPage', () => {
      const meta1 = paginationMeta(50, 3, 10);
      expect(meta1.hasNextPage).toBe(true);
      expect(meta1.hasPrevPage).toBe(true);

      const meta2 = paginationMeta(50, 5, 10);
      expect(meta2.hasNextPage).toBe(false);
      expect(meta2.hasPrevPage).toBe(true);
    });

    it('debe manejar casos con registros que no dividen exactamente', () => {
      const meta = paginationMeta(25, 2, 10);
      expect(meta.totalPages).toBe(3);
      expect(meta.hasNextPage).toBe(true);
    });

    it('debe manejar caso sin registros', () => {
      const meta = paginationMeta(0, 1, 10);
      expect(meta.totalPages).toBe(0);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });
  });
});
