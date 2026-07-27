'use client';

import { useRef, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { flushSync } from 'react-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/theme-context';

interface DocumentWithViewTransition extends Omit<Document, 'startViewTransition'> {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme: contextToggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseToggleTheme = useCallback(() => {
    contextToggleTheme();
  }, [contextToggleTheme]);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (!button) {
      baseToggleTheme();
      return;
    }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const doc = document as DocumentWithViewTransition;

    if (!doc.startViewTransition) {
      baseToggleTheme();
      return;
    }

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        baseToggleTheme();
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }, [baseToggleTheme]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-full bg-surface border border-border hover:border-foreground/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 text-foreground shadow-xs',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-foreground" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
