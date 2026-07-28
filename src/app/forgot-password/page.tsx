import type { Metadata } from 'next';
import { ForgotPasswordView } from '@/views';

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your CrypLounge password.",
};

export default function Page() {
  return <ForgotPasswordView />;
}
