import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockEcosystemBanners, EcosystemBanner } from '../data/mockEcosystemBanners';

interface EcosystemBannersContextType {
  banners: EcosystemBanner[];
  loading: boolean;
  getBannerByEcosystem: (ecosystem: string) => EcosystemBanner | undefined;
  addBanner: (banner: Omit<EcosystemBanner, 'id' | 'uploadedAt' | 'updatedAt'>) => void;
  updateBanner: (id: string, updates: Partial<EcosystemBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerStatus: (id: string) => void;
  refreshBanners: () => void;
}

const EcosystemBannersContext = createContext<EcosystemBannersContextType | undefined>(undefined);

export function EcosystemBannersProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<EcosystemBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBanners(mockEcosystemBanners);
      setLoading(false);
    }, 300);
  };

  const getBannerByEcosystem = (ecosystem: string): EcosystemBanner | undefined => {
    return banners.find(b => b.ecosystem === ecosystem && b.isActive);
  };

  const addBanner = (banner: Omit<EcosystemBanner, 'id' | 'uploadedAt' | 'updatedAt'>) => {
    const newBanner: EcosystemBanner = {
      ...banner,
      id: String(Date.now()),
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBanners(prev => [newBanner, ...prev]);
  };

  const updateBanner = (id: string, updates: Partial<EcosystemBanner>) => {
    setBanners(prev => prev.map(b => 
      b.id === id 
        ? { ...b, ...updates, updatedAt: new Date().toISOString() }
        : b
    ));
  };

  const deleteBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const toggleBannerStatus = (id: string) => {
    setBanners(prev => prev.map(b => 
      b.id === id 
        ? { ...b, isActive: !b.isActive, updatedAt: new Date().toISOString() }
        : b
    ));
  };

  const refreshBanners = () => {
    loadBanners();
  };

  return (
    <EcosystemBannersContext.Provider
      value={{
        banners,
        loading,
        getBannerByEcosystem,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        refreshBanners
      }}
    >
      {children}
    </EcosystemBannersContext.Provider>
  );
}

export function useEcosystemBanners() {
  const context = useContext(EcosystemBannersContext);
  if (context === undefined) {
    throw new Error('useEcosystemBanners must be used within an EcosystemBannersProvider');
  }
  return context;
}
