import { PageLayout } from '@/components/shared/PageLayout';
import PostsAdminClient from '@/components/admin/PostsAdminClient';

export default function AdminPostsPage() {
  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      <PageLayout>
        <PostsAdminClient />
      </PageLayout>
    </section>
  );
}
