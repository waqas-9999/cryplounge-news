'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { LearnCategoriesProvider } from '@/contexts/LearnCategoriesContext';
import { EcosystemsProvider } from '@/contexts/EcosystemsContext';
import { EcosystemBannersProvider } from '@/contexts/EcosystemBannersContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { FoundersProvider } from '@/contexts/FoundersContext';
import { PromotionsProvider } from '@/contexts/PromotionsContext';
import { XPProvider } from '@/contexts/XPContext';

/**
 * All application context providers, composed once.
 *
 * In the original Vite app only ThemeProvider and CategoriesProvider were
 * mounted, so anything depending on auth, XP, events, founders, ecosystems or
 * promotions could never work. All of them are mounted here.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <XPProvider>
          <CategoriesProvider>
            <LearnCategoriesProvider>
              <EcosystemsProvider>
                <EcosystemBannersProvider>
                  <FoundersProvider>
                    <EventsProvider>
                      <PromotionsProvider>{children}</PromotionsProvider>
                    </EventsProvider>
                  </FoundersProvider>
                </EcosystemBannersProvider>
              </EcosystemsProvider>
            </LearnCategoriesProvider>
          </CategoriesProvider>
        </XPProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
