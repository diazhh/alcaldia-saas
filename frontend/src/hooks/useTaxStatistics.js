/**
 * Hook personalizado para obtener estadísticas tributarias
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { API_URL } from '@/constants';

const API_BASE_URL = API_URL;

/**
 * Hook para obtener todas las estadísticas del dashboard
 */
export function useTaxDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/tax/statistics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  return { data, loading, error };
}

/**
 * Hook para obtener estadísticas generales
 */
export function useGeneralStatistics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/tax/statistics/general`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching general statistics:', err);
        setError(err.response?.data?.message || 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return { stats, loading, error };
}

/**
 * Hook para obtener recaudación mensual
 */
export function useMonthlyCollection() {
  const { token } = useAuth();
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/tax/statistics/monthly-collection`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setCollection(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching monthly collection:', err);
        setError(err.response?.data?.message || 'Error al cargar recaudación mensual');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [token]);

  return { collection, loading, error };
}

/**
 * Hook para obtener distribución por tipo de impuesto
 */
export function useTaxTypeDistribution() {
  const { token } = useAuth();
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchDistribution = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/tax/statistics/tax-type-distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDistribution(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching tax type distribution:', err);
        setError(err.response?.data?.message || 'Error al cargar distribución');
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, [token]);

  return { distribution, loading, error };
}

/**
 * Hook para obtener top contribuyentes
 */
export function useTopContributors(limit = 5) {
  const { token } = useAuth();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchContributors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/tax/statistics/top-contributors?limit=${limit}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setContributors(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching top contributors:', err);
        setError(err.response?.data?.message || 'Error al cargar contribuyentes');
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [token, limit]);

  return { contributors, loading, error };
}

/**
 * Hook para obtener alertas
 */
export function useAlerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/tax/statistics/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setAlerts(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError(err.response?.data?.message || 'Error al cargar alertas');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [token]);

  return { alerts, loading, error };
}
