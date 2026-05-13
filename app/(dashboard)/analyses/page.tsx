import { AnalysesTable } from "@/components/analyses/AnalysesTable";

export default function AnalysesPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Analyses</h1>
      <AnalysesTable />
    </div>
  );
}
