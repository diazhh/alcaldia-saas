import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

/**
 * Componente FormField
 * Envuelve un campo de formulario con label y mensaje de error
 */
export const FormField = React.forwardRef(
  ({ label, error, children, required, className, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {label && (
          <Label>
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </Label>
        )}
        {children}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

/**
 * Componente FormError
 * Muestra un mensaje de error general del formulario
 */
export const FormError = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-md bg-danger/10 border border-danger/20 p-3">
      <p className="text-sm text-danger">{message}</p>
    </div>
  );
};

/**
 * Componente FormSuccess
 * Muestra un mensaje de éxito
 */
export const FormSuccess = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-md bg-success/10 border border-success/20 p-3">
      <p className="text-sm text-success">{message}</p>
    </div>
  );
};
