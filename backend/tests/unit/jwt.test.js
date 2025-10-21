/**
 * Tests unitarios para JWT
 */
import { generateToken, verifyToken, jwtConfig } from '../../src/config/jwt.js';

describe('JWT Functions', () => {
  describe('generateToken', () => {
    it('debe generar un token válido', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'EMPLEADO',
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT tiene 3 partes
    });

    it('debe incluir el payload en el token', () => {
      const payload = {
        userId: '456',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('verifyToken', () => {
    it('debe verificar un token válido', () => {
      const payload = {
        userId: '789',
        email: 'user@example.com',
        role: 'EMPLEADO',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });

    it('debe lanzar error con token inválido', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow('Token inválido o expirado');
    });

    it('debe lanzar error con token malformado', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => verifyToken(malformedToken)).toThrow('Token inválido o expirado');
    });

    it('debe lanzar error con token vacío', () => {
      expect(() => verifyToken('')).toThrow('Token inválido o expirado');
    });
  });

  describe('jwtConfig', () => {
    it('debe tener configuración definida', () => {
      expect(jwtConfig).toBeDefined();
      expect(jwtConfig).toHaveProperty('secret');
      expect(jwtConfig).toHaveProperty('expiresIn');
    });

    it('debe usar variables de entorno o valores por defecto', () => {
      expect(typeof jwtConfig.secret).toBe('string');
      expect(jwtConfig.secret.length).toBeGreaterThan(0);
      expect(typeof jwtConfig.expiresIn).toBe('string');
    });
  });
});
