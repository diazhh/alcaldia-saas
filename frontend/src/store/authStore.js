import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store de autenticación con Zustand
 * Maneja el estado global de autenticación del usuario
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Acciones
      /**
       * Inicia sesión y guarda el usuario y token
       * @param {Object} user - Datos del usuario
       * @param {string} token - Token JWT
       */
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      /**
       * Cierra sesión y limpia el estado
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      /**
       * Actualiza los datos del usuario
       * @param {Object} userData - Datos actualizados del usuario
       */
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      /**
       * Establece el estado de carga
       * @param {boolean} loading - Estado de carga
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Verifica si el usuario tiene un rol específico
       * @param {string} role - Rol a verificar
       * @returns {boolean}
       */
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      /**
       * Verifica si el usuario tiene uno de los roles especificados
       * @param {string[]} roles - Array de roles
       * @returns {boolean}
       */
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
