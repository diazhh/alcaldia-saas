import * as React from 'react';
import { cn } from '@/lib/utils';

const Popover = ({ children, open, onOpenChange }) => {
  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (child.type === PopoverTrigger) {
          return React.cloneElement(child, { onClick: () => onOpenChange?.(!open) });
        }
        if (child.type === PopoverContent && open) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const PopoverTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      ...props,
      className: cn(children.props.className, className),
    });
  }

  return (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  );
});
PopoverTrigger.displayName = 'PopoverTrigger';

const PopoverContent = React.forwardRef(({ className, align = 'center', ...props }, ref) => {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-2 rounded-md border bg-white shadow-md',
        alignmentClasses[align],
        className
      )}
      {...props}
    />
  );
});
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
