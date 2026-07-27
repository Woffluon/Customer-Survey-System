'use client';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import React, {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../lib/utils';

const PASSWORD_CHAR =
  typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.userAgent.match(/firefox|fxios/i)
    ? '\u25CF'
    : '\u2022';

const SPRING = { stiffness: 500, damping: 30, mass: 0.5 };

// ---------------------------------------------------------------------------
// SmoothInput — single-line
// ---------------------------------------------------------------------------

type SmoothInputProps = ComponentPropsWithoutRef<'input'> & {
  wrapperClassName?: string;
};

export function SmoothInput({
  className,
  wrapperClassName,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  ...props
}: SmoothInputProps) {
  const [internalValue, setInternalValue] = useState<string>(
    typeof defaultValue === 'string' ? defaultValue : '',
  );
  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const isControlled = value !== undefined;
  const inputValue = isControlled ? String(value) : internalValue;

  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion ? { stiffness: 10000, damping: 100, mass: 0.1 } : SPRING,
  );

  const isTouchDevice =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const syncMeasureSpan = () => {
    if (typeof window === 'undefined') return;
    const input = inputRef.current;
    const span = measureRef.current;
    if (!input || !span) return;
    const s = window.getComputedStyle(input);
    const isPassword = input.type === 'password';
    let fontSize = s.fontSize;
    if (
      PASSWORD_CHAR === '\u2022' &&
      isPassword &&
      typeof navigator !== 'undefined' &&
      !navigator.userAgent.match(/chrome|chromium|crios/i)
    ) {
      fontSize = `${parseFloat(fontSize) + 6.25}px`;
    }
    span.style.font = `${s.fontStyle} ${s.fontWeight} ${fontSize} ${s.fontFamily}`;
    span.style.letterSpacing = s.letterSpacing;
  };

  const measurePrefixWidth = (text: string): number | null => {
    if (typeof window === 'undefined') return null;
    const input = inputRef.current;
    const span = measureRef.current;
    if (!input || !span) return null;
    syncMeasureSpan();
    span.textContent = text;
    const paddingLeft = parseFloat(window.getComputedStyle(input).paddingLeft) || 0;
    return text.length > 0 ? span.offsetWidth + paddingLeft : paddingLeft - 1;
  };

  const scrollCaretIntoView = (target: HTMLInputElement, absW: number) => {
    if (typeof window === 'undefined') return;
    const s = window.getComputedStyle(target);
    const pl = parseFloat(s.paddingLeft) || 0;
    const pr = parseFloat(s.paddingRight) || 0;
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
    const visRight = target.scrollLeft + target.clientWidth - pr;
    const visLeft = target.scrollLeft + pl;
    if (absW > visRight) {
      target.scrollLeft = Math.min(absW - target.clientWidth + pr, maxScroll);
    } else if (absW < visLeft) {
      target.scrollLeft = Math.max(0, absW - pl);
    }
  };

  const getCaretIndex = (target: HTMLInputElement) => {
    const ss = target.selectionStart ?? 0;
    const se = target.selectionEnd ?? 0;
    return ss === se ? ss : target.selectionDirection === 'backward' ? ss : se;
  };

  const updateCaretFromInput = (target: HTMLInputElement) => {
    if (typeof window === 'undefined' || isTouchDevice) return;
    const ss = target.selectionStart ?? 0;
    const se = target.selectionEnd ?? 0;
    const hasSelection = ss !== se;
    const idx = getCaretIndex(target);
    const isPassword = target.type === 'password';
    const textBefore = isPassword
      ? PASSWORD_CHAR.repeat(idx)
      : target.value.slice(0, idx);

    const absW = measurePrefixWidth(textBefore);
    if (absW === null) return;

    scrollCaretIntoView(target, absW);

    const s = window.getComputedStyle(target);
    const pl = parseFloat(s.paddingLeft) || 0;
    const pr = parseFloat(s.paddingRight) || 0;
    const pos = absW - target.scrollLeft;
    const minX = pl - 1;
    const maxX = target.clientWidth - pr;
    const visible = pos >= minX && pos <= maxX + 1;

    caretX.set(Math.min(pos, maxX));

    if (!visible || hasSelection) {
      caretOpacity.set(0);
    } else {
      caretOpacity.set(1);
    }
  };

  const updateCaretRef = useRef(updateCaretFromInput);
  updateCaretRef.current = updateCaretFromInput;
  const caretOpacityRef = useRef(caretOpacity);
  caretOpacityRef.current = caretOpacity;

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) updateCaretRef.current(input);
  }, [inputValue]);

  useEffect(() => {
    if (typeof window === 'undefined' || isTouchDevice) return;
    const input = inputRef.current;
    const container = containerRef.current;
    if (!input || !container) return;

    const updateIfFocused = () => {
      if (document.activeElement === input) updateCaretRef.current(input);
    };
    const onSelectionChange = () => {
      if (document.activeElement !== input) return;
      requestAnimationFrame(() => {
        if (document.activeElement === input) updateCaretRef.current(input);
      });
    };

    document.addEventListener('selectionchange', onSelectionChange);
    if (document.fonts) {
      document.fonts.addEventListener('loadingdone', updateIfFocused);
      void document.fonts.ready.then(updateIfFocused);
    }
    input.addEventListener('scroll', updateIfFocused);

    const ro = new ResizeObserver(updateIfFocused);
    ro.observe(container);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      if (document.fonts) {
        document.fonts.removeEventListener('loadingdone', updateIfFocused);
      }
      input.removeEventListener('scroll', updateIfFocused);
      ro.disconnect();
    };
  }, [isTouchDevice]);

  return (
    <div className={cn('relative', wrapperClassName)}>
      <div
        ref={containerRef}
        className="relative grid grid-cols-1"
        style={{ caretColor: isTouchDevice ? 'auto' : 'transparent' }}
      >
        <input
          {...props}
          ref={inputRef}
          type={type}
          value={inputValue}
          className={cn(
            'col-start-1 col-end-2 row-start-1 row-end-2',
            'w-full px-4 py-3 bg-background border border-border rounded-xl',
            'text-foreground text-sm placeholder:text-muted/60',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:border-foreground transition-colors',
            className,
          )}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
            if (!isTouchDevice) {
              requestAnimationFrame(() => updateCaretRef.current(e.target));
            }
          }}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            onFocus?.(e);
            if (!isTouchDevice) {
              requestAnimationFrame(() => updateCaretRef.current(e.target));
            }
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            caretOpacityRef.current.set(0);
            onBlur?.(e);
          }}
        />
        <span
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
        />
        {!isTouchDevice && (
          <motion.div
            className="bg-foreground pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 h-[0.9em] w-0.5 self-center"
            style={{ x: springCaretX, opacity: caretOpacity }}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SmoothTextarea — multi-line
// ---------------------------------------------------------------------------

type SmoothTextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  wrapperClassName?: string;
};

export function SmoothTextarea({
  className,
  wrapperClassName,
  value,
  defaultValue,
  onChange,
  rows = 4,
  ...props
}: SmoothTextareaProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <textarea
        {...props}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={cn(
          'w-full px-4 py-3 bg-background border border-border rounded-xl',
          'text-foreground text-sm placeholder:text-muted/60',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:border-foreground transition-colors',
          'resize-y min-h-[120px]',
          'caret-foreground',
          className,
        )}
      />
    </div>
  );
}
