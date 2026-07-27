'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { flushSync } from 'react-dom';
import { cn } from '../lib/utils';

interface DocumentWithViewTransition extends Omit<Document, 'startViewTransition'> {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
}

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('survey_theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);


  const baseToggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const nextDark = !prev;
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('survey_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('survey_theme', 'light');
      }
      return nextDark;
    });
  }, []);

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

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-full bg-surface border border-border hover:border-foreground/30 transition-colors focus:outline-none text-foreground shadow-xs',
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
