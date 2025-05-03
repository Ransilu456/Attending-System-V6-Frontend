import React from 'react';
import { cn } from '../../utils/cn';

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('relative overflow-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = 'ScrollArea';

export { ScrollArea }; 