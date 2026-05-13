import pool from "@/lib/db";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default async function AppointmentsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [pending, confirmed, cancelled] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM appointments WHERE status = 'pending' AND created_at::date >= $1", [today]),
    pool.query("SELECT COUNT(*) FROM appointments WHERE status = 'confirmed' AND created_at::date >= $1", [today]),
    pool.query("SELECT COUNT(*) FROM appointments WHERE status = 'cancelled' AND created_at::date >= $1", [today]),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Rendez-vous</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="En attente (aujourd'hui)" value={Number(pending.rows[0].count)} icon={Clock} color="orange" />
        <StatsCard title="Confirmés (aujourd'hui)" value={Number(confirmed.rows[0].count)} icon={CheckCircle} color="green" />
        <StatsCard title="Annulés (aujourd'hui)" value={Number(cancelled.rows[0].count)} icon={XCircle} color="red" />
      </div>

      <AppointmentTable />
    </div>
  );
}
