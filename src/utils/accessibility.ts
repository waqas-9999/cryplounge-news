/**
 * Accessibility Utilities
 * WCAG 2.1 Level AA compliant helpers and ARIA utilities
 */

/**
 * Calculate color contrast ratio between two colors
 * Based on WCAG 2.1 guidelines
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Apply gamma correction
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    // Calculate relative luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsContrastAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generate ARIA label for navigation
 */
export function generateAriaLabel(
  type: 'navigation' | 'breadcrumb' | 'pagination' | 'search' | 'menu',
  context?: string
): string {
  const labels: Record<string, string> = {
    navigation: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    search: 'Search',
    menu: 'Menu',
  };

  const baseLabel = labels[type] || type;
  return context ? `${baseLabel} - ${context}` : baseLabel;
}

/**
 * Generate skip link for keyboard navigation
 */
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = text;
  link.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground';
  return link;
}

/**
 * Manage focus trap for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private previousActiveElement: HTMLElement | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.updateFocusableElements();
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    this.focusableElements = Array.from(
      this.element.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate() {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.updateFocusableElements();

    // Focus first element
    if (this.firstFocusable) {
      this.firstFocusable.focus();
    }

    // Add event listener for tab key
    this.element.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  if (typeof document === 'undefined') return;

  let announcer = document.getElementById('screen-reader-announcer');

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  // Update aria-live if needed
  if (announcer.getAttribute('aria-live') !== priority) {
    announcer.setAttribute('aria-live', priority);
  }

  // Clear and set new message
  announcer.textContent = '';
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get appropriate animation duration based on user preference
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Validate form accessibility
 */
export interface FormAccessibilityIssue {
  element: HTMLElement;
  issue: string;
  severity: 'error' | 'warning';
}

export function validateFormAccessibility(form: HTMLFormElement): FormAccessibilityIssue[] {
  const issues: FormAccessibilityIssue[] = [];

  // Check all inputs have labels
  const inputs = form.querySelectorAll<HTMLInputElement>('input, textarea, select');
  inputs.forEach(input => {
    const id = input.id;
    if (!id) {
      issues.push({
        element: input,
        issue: 'Input missing id attribute',
        severity: 'error',
      });
      return;
    }

    const label = form.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push({
        element: input,
        issue: 'Input missing associated label',
        severity: 'error',
      });
    }
  });

  // Check required fields have aria-required
  const requiredInputs = form.querySelectorAll<HTMLInputElement>('input[required], textarea[required], select[required]');
  requiredInputs.forEach(input => {
    if (!input.hasAttribute('aria-required')) {
      issues.push({
        element: input,
        issue: 'Required input missing aria-required attribute',
        severity: 'warning',
      });
    }
  });

  // Check error messages are associated with inputs
  const invalidInputs = form.querySelectorAll<HTMLInputElement>('[aria-invalid="true"]');
  invalidInputs.forEach(input => {
    const describedBy = input.getAttribute('aria-describedby');
    if (!describedBy) {
      issues.push({
        element: input,
        issue: 'Invalid input missing aria-describedby for error message',
        severity: 'error',
      });
    }
  });

  return issues;
}

/**
 * Create accessible tooltip
 */
export function createAccessibleTooltip(
  trigger: HTMLElement,
  content: string,
  options: {
    id?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  } = {}
): HTMLElement {
  const tooltipId = options.id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  
  const tooltip = document.createElement('div');
  tooltip.id = tooltipId;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.className = 'absolute z-50 px-2 py-1 bg-gray-900 text-white rounded text-sm opacity-0 pointer-events-none transition-opacity';
  tooltip.textContent = content;

  trigger.setAttribute('aria-describedby', tooltipId);

  trigger.addEventListener('mouseenter', () => {
    tooltip.classList.remove('opacity-0');
    tooltip.classList.add('opacity-100');
  });

  trigger.addEventListener('mouseleave', () => {
    tooltip.classList.add('opacity-0');
    tooltip.classList.remove('opacity-100');
  });

  trigger.appendChild(tooltip);
  return tooltip;
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const ariaHidden = element.getAttribute('aria-hidden') === 'true';
  const hidden = element.hasAttribute('hidden');
  const display = window.getComputedStyle(element).display === 'none';
  const visibility = window.getComputedStyle(element).visibility === 'hidden';

  return !ariaHidden && !hidden && !display && !visibility;
}

/**
 * Add screen reader only text
 */
export function addSROnlyText(element: HTMLElement, text: string) {
  const srOnly = document.createElement('span');
  srOnly.className = 'sr-only';
  srOnly.textContent = text;
  element.appendChild(srOnly);
}
