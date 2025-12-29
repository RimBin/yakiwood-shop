import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Create Yakiwood Account',
  description: 'Create a Yakiwood account to save your projects, track orders, and get personalized recommendations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
