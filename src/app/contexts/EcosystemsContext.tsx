import { createContext, useContext, useState, ReactNode } from 'react';
import { defaultEcosystems, Ecosystem } from '../data/mockEcosystems';

interface EcosystemsContextType {
  ecosystems: Ecosystem[];
  addEcosystem: (ecosystem: Omit<Ecosystem, 'id' | 'createdAt' | 'updatedAt' | 'tutorialCount' | 'projectCount'>) => void;
  updateEcosystem: (id: string, updates: Partial<Ecosystem>) => void;
  deleteEcosystem: (id: string) => void;
  getEcosystemById: (id: string) => Ecosystem | undefined;
  getEcosystemBySlug: (slug: string) => Ecosystem | undefined;
  getActiveEcosystems: () => Ecosystem[];
  getFeaturedEcosystems: () => Ecosystem[];
}

const EcosystemsContext = createContext<EcosystemsContextType | undefined>(undefined);

export function EcosystemsProvider({ children }: { children: ReactNode }) {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>(defaultEcosystems);

  const addEcosystem = (ecosystemData: Omit<Ecosystem, 'id' | 'createdAt' | 'updatedAt' | 'tutorialCount' | 'projectCount'>) => {
    const newEcosystem: Ecosystem = {
      ...ecosystemData,
      id: Date.now().toString(),
      tutorialCount: 0,
      projectCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEcosystems(prev => [...prev, newEcosystem]);
  };

  const updateEcosystem = (id: string, updates: Partial<Ecosystem>) => {
    setEcosystems(prev =>
      prev.map(eco =>
        eco.id === id
          ? { ...eco, ...updates, updatedAt: new Date().toISOString() }
          : eco
      )
    );
  };

  const deleteEcosystem = (id: string) => {
    setEcosystems(prev => prev.filter(eco => eco.id !== id));
  };

  const getEcosystemById = (id: string) => {
    return ecosystems.find(eco => eco.id === id);
  };

  const getEcosystemBySlug = (slug: string) => {
    return ecosystems.find(eco => eco.slug === slug);
  };

  const getActiveEcosystems = () => {
    return ecosystems.filter(eco => eco.isActive);
  };

  const getFeaturedEcosystems = () => {
    return ecosystems.filter(eco => eco.isActive && eco.featured);
  };

  return (
    <EcosystemsContext.Provider
      value={{
        ecosystems,
        addEcosystem,
        updateEcosystem,
        deleteEcosystem,
        getEcosystemById,
        getEcosystemBySlug,
        getActiveEcosystems,
        getFeaturedEcosystems
      }}
    >
      {children}
    </EcosystemsContext.Provider>
  );
}

export function useEcosystems() {
  const context = useContext(EcosystemsContext);
  if (context === undefined) {
    throw new Error('useEcosystems must be used within an EcosystemsProvider');
  }
  return context;
}
