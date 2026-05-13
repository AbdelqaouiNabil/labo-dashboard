import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysesLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
      <Skeleton className="h-[500px] rounded-lg" />
    </div>
  );
}
