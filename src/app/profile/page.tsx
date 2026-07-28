import type { Metadata } from 'next';
import { ProfileView } from '@/views';

export const metadata: Metadata = {
  title: "Your Profile",
  description: "Manage your CrypLounge profile, saved articles and progress.",
};

export default function Page() {
  return <ProfileView />;
}
