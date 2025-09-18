
import * as React from 'react';
import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRefs = React.useCallback(
      (instance: HTMLTextAreaElement) => {
        internalRef.current = instance;
        if (typeof ref === 'function') {
          ref(instance);
        } else if (ref) {
          ref.current = instance;
        }
      },
      [ref]
    );

    React.useLayoutEffect(() => {
      const element = internalRef.current;
      if (element) {
        // Temporarily reset height to auto to get the correct scrollHeight
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
      }
    }, [props.value]);

    return (
      <textarea
        className={cn(
          'flex w-full resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={setRefs}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
