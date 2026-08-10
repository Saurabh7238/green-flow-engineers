import { AdminShell } from "@/components/admin/AdminShell";
import { NotificationManager } from "@/components/admin/NotificationManager";

export default function AdminNotificationsPage() {
  return (
    <AdminShell title="Popup Notification Manager" description="Control the visitor notification popup content and status.">
      <NotificationManager />
    </AdminShell>
  );
}
