import React from 'react';
import { cn } from '../../utils/cn';
import { Check, ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {children}
    </div>
  );
});
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef(({ className, children, placeholder, ...props }, ref) => (
  <span className={cn('flex h-full items-center gap-2', className)} ref={ref} {...props}>
    {children || <span className="text-muted-foreground">{placeholder}</span>}
  </span>
));
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef(({ className, children, position = 'popper', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
      position === 'popper' && 'mt-1',
      className
    )}
    {...props}
  >
    <div className="w-full p-1">{children}</div>
  </div>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ className, children, selected, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {selected && <Check className="h-4 w-4" />}
    </span>
    {children}
  </button>
));
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }; 