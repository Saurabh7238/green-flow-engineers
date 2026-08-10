import { AdminShell } from "@/components/admin/AdminShell";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export default function AdminReviewsPage() {
  return (
    <AdminShell title="Reviews Manager" description="Review, approve, and delete customer feedback.">
      <ReviewsManager />
    </AdminShell>
  );
}
