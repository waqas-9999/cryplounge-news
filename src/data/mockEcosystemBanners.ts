// Mock data for ecosystem banners
// In production, this will be fetched from the backend

export interface EcosystemBanner {
  id: string;
  ecosystem: string;
  bannerUrl: string;
  bannerPosition: 'center' | 'top' | 'bottom';
  overlayOpacity: number; // 0-100 for text readability
  isActive: boolean;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: string;
}

export const mockEcosystemBanners: EcosystemBanner[] = [
  {
    id: '1',
    ecosystem: 'bitcoin',
    bannerUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=400&fit=crop',
    bannerPosition: 'center',
    overlayOpacity: 50,
    isActive: true,
    uploadedAt: '2025-11-10T10:00:00Z',
    updatedAt: '2025-11-10T10:00:00Z',
    uploadedBy: 'cryploungeofficial@gmail.com'
  },
  {
    id: '2',
    ecosystem: 'ethereum',
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop',
    bannerPosition: 'center',
    overlayOpacity: 45,
    isActive: true,
    uploadedAt: '2025-11-11T10:00:00Z',
    updatedAt: '2025-11-11T10:00:00Z',
    uploadedBy: 'cryploungeofficial@gmail.com'
  },
  {
    id: '3',
    ecosystem: 'solana',
    bannerUrl: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=1200&h=400&fit=crop',
    bannerPosition: 'center',
    overlayOpacity: 50,
    isActive: true,
    uploadedAt: '2025-11-12T10:00:00Z',
    updatedAt: '2025-11-12T10:00:00Z',
    uploadedBy: 'cryploungeofficial@gmail.com'
  },
  {
    id: '4',
    ecosystem: 'polygon',
    bannerUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1200&h=400&fit=crop',
    bannerPosition: 'center',
    overlayOpacity: 55,
    isActive: true,
    uploadedAt: '2025-11-13T10:00:00Z',
    updatedAt: '2025-11-13T10:00:00Z',
    uploadedBy: 'cryploungeofficial@gmail.com'
  }
];

// Helper function to get banner by ecosystem
export function getBannerByEcosystem(ecosystem: string): EcosystemBanner | undefined {
  return mockEcosystemBanners.find(b => b.ecosystem === ecosystem && b.isActive);
}

// Helper function to get all active banners
export function getActiveBanners(): EcosystemBanner[] {
  return mockEcosystemBanners.filter(b => b.isActive);
}

// Helper function to check if ecosystem has banner
export function hasEcosystemBanner(ecosystem: string): boolean {
  return mockEcosystemBanners.some(b => b.ecosystem === ecosystem && b.isActive);
}
