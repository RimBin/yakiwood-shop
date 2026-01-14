import ProjectsAdminClient from '@/components/admin/ProjectsAdminClient'
import { AdminBody } from '@/components/admin/ui/AdminUI'

export default function AdminProjectsPage() {
  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <ProjectsAdminClient />
    </AdminBody>
  )
}
