import type { Metadata } from 'next';
import { SignupView } from '@/views';

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free CrypLounge account.",
};

export default function Page() {
  return <SignupView />;
}
