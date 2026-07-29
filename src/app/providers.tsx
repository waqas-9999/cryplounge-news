'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { EcosystemsProvider } from '@/contexts/EcosystemsContext';
import { EcosystemBannersProvider } from '@/contexts/EcosystemBannersContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { FoundersProvider } from '@/contexts/FoundersContext';
import { PromotionsProvider } from '@/contexts/PromotionsContext';

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
        <EcosystemsProvider>
          <EcosystemBannersProvider>
            <FoundersProvider>
              <EventsProvider>
                <PromotionsProvider>{children}</PromotionsProvider>
              </EventsProvider>
            </FoundersProvider>
          </EcosystemBannersProvider>
        </EcosystemsProvider>
      </CategoriesProvider>
    </ThemeProvider>
  );
}
