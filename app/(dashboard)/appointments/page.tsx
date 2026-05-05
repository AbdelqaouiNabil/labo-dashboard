import { createClient } from "@/lib/supabase/server";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: pending },
    { count: confirmed },
    { count: cancelled },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending").gte("created_at", today),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "confirmed").gte("created_at", today),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "cancelled").gte("created_at", today),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Rendez-vous</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="En attente (aujourd'hui)" value={pending ?? 0} icon={Clock} color="orange" />
        <StatsCard title="Confirmés (aujourd'hui)" value={confirmed ?? 0} icon={CheckCircle} color="green" />
        <StatsCard title="Annulés (aujourd'hui)" value={cancelled ?? 0} icon={XCircle} color="red" />
      </div>

      <AppointmentTable />
    </div>
  );
}
