import type { Metadata } from 'next';
import { LoginView } from '@/views';

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your CrypLounge account.",
};

export default function Page() {
  return <LoginView />;
}
