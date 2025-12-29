import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account - Yakiwood',
  description: 'Manage your Yakiwood account, view orders, saved projects, and account settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
