import { AdminShell } from "@/components/admin/AdminShell";
import { GalleryManager } from "@/components/GalleryManager";

export default function AdminGalleryPage() {
  return (
    <AdminShell title="Gallery Manager" description="Manage gallery project and machinery items.">
      <GalleryManager />
    </AdminShell>
  );
}
