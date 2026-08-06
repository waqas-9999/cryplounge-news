'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { FoundersProvider } from '@/contexts/FoundersContext';

/**
 * All application context providers, composed once.
 *
 * CrypLounge is a public editorial platform: there are no reader accounts and
 * no per-reader state, so there is no auth or XP provider here.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CategoriesProvider>
        <FoundersProvider>
          <EventsProvider>{children}</EventsProvider>
        </FoundersProvider>
      </CategoriesProvider>
    </ThemeProvider>
  );
}
