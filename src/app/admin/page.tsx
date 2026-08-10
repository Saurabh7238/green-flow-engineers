import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell title="Admin Dashboard" description="Choose a manager from the menu to start.">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Welcome to admin management</h2>
        <p className="mt-4 text-sm text-slate-600">Select a specific admin page from the navigation menu to manage service content, notifications, sliders, reviews, or enquiries.</p>
      </div>
    </AdminShell>
  );
}
