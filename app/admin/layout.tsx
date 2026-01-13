import type { ReactNode } from 'react';
import AdminPanelHeader from '@/components/admin/AdminPanelHeader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminPanelHeader />
      {children}
    </>
  );
}
