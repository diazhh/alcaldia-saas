import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de forma inteligente
 * @param {...any} inputs - Clases a combinar
 * @returns {string} Clases combinadas
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda venezolana
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
  }).format(amount);
}

/**
 * Formatea una fecha
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato de salida
 * @returns {string} Fecha formateada
 */
export function formatDate(date, format = 'dd/MM/yyyy') {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-VE');
}
