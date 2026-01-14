import PostsAdminClient from '@/components/admin/PostsAdminClient';
import { AdminBody, AdminCard } from '@/components/admin/ui/AdminUI';

export default function AdminPostsPage() {
  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminCard>
        <PostsAdminClient />
      </AdminCard>
    </AdminBody>
  );
}
