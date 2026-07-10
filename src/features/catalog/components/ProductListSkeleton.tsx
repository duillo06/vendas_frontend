import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProductListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card-premium overflow-hidden">
          <Skeleton className="min-h-[12rem] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
