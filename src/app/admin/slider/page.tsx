import { AdminShell } from "@/components/admin/AdminShell";
import { SliderManager } from "@/components/admin/SliderManager";

export default function AdminSliderPage() {
  return (
    <AdminShell title="Homepage Slider Manager" description="Manage homepage hero slides and media content.">
      <SliderManager />
    </AdminShell>
  );
}
