import { AdminShell } from "@/components/admin/AdminShell";
import { ServiceContentManager } from "@/components/admin/ServiceContentManager";

export default function AdminContentManagerPage() {
  return (
    <AdminShell title="Service Content Manager" description="Manage service portfolio content by vertical and subtype.">
      <ServiceContentManager />
    </AdminShell>
  );
}
