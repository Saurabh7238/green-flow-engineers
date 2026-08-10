import { AdminShell } from "@/components/admin/AdminShell";
import { ServiceContentManager } from "@/components/admin/ServiceContentManager";
import { NotificationManager } from "@/components/admin/NotificationManager";
import { SliderManager } from "@/components/admin/SliderManager";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";

export default function AdminAllPage() {
  return (
    <AdminShell title="Admin Dashboard" description="Access all management tools in one place.">
      <div className="space-y-10">
        <ServiceContentManager />
        <NotificationManager />
        <SliderManager />
        <ReviewsManager />
        <EnquiriesManager />
      </div>
    </AdminShell>
  );
}
