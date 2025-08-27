import * as React from 'react';
import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    const [height, setHeight] = React.useState('auto');
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
      if (internalRef.current) {
        const {scrollHeight} = internalRef.current;
        setHeight(`${scrollHeight}px`);
      }
    }, [props.value]);

    return (
      <textarea
        style={{height}}
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
