import { useAuthStore } from '@/store/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

/**
 * Hook personalizado para autenticación
 * Proporciona funciones y estado de autenticación
 */
export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();

  /**
   * Mutación de login
   */
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, rememberMe }) => {
      const response = await api.post('/auth/login', { email, password, rememberMe });
      return response.data;
    },
    onSuccess: (data) => {
      // La API devuelve { success: true, data: { user, token } }
      const userData = data.data || data;
      login(userData.user, userData.token);
      router.push('/');
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  /**
   * Mutación de registro
   */
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      // La API devuelve { success: true, data: { user, token } }
      const userData = data.data || data;
      login(userData.user, userData.token);
      router.push('/');
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });

  /**
   * Query para obtener usuario actual
   */
  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    enabled: !!token,
    onSuccess: (data) => {
      updateUser(data.user);
    },
  });

  /**
   * Función de logout
   */
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  /**
   * Mutación para cambiar contraseña
   */
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    },
  });

  /**
   * Mutación para actualizar perfil
   */
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data.user);
    },
  });

  return {
    // Estado
    user,
    token,
    isAuthenticated,
    currentUser,

    // Funciones - usar mutateAsync para poder hacer try/catch
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: handleLogout,
    changePassword: changePasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    refetchUser,

    // Estados de carga
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Errores
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    changePasswordError: changePasswordMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
}
