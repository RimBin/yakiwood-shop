import type { ReactNode } from 'react';
import AdminPanelHeader from '@/components/admin/AdminPanelHeader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="yw-admin-scope min-h-screen bg-[#EAEAEA]">
      <AdminPanelHeader />
      {children}
    </div>
  );
}
