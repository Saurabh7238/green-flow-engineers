import { AdminShell } from "@/components/admin/AdminShell";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";

export default function AdminEnquiriesPage() {
  return (
    <AdminShell title="Enquiries Manager" description="View and manage contact form submissions.">
      <EnquiriesManager />
    </AdminShell>
  );
}
