import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Yakiwood Account',
  description: 'Sign in to your Yakiwood account to access your orders, saved projects, and account settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
