import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CaretDown, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    width?: number | string;
  }
>(({ className, align = 'start', sideOffset = 6, width = 280, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      style={{ width }}
      className={cn(
        'z-50 overflow-hidden rounded-xl border border-line bg-bg-1 p-1 shadow-pop',
        'data-[state=open]:animate-fade-in',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { CaretDown, Check };
