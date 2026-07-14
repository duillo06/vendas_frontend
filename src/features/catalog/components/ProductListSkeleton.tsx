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

/** skeleton da listagem densa (categoria) */
export function ProductListRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full">
      <div className="divide-y divide-[hsl(0_0%_90%)]">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-20 w-20 shrink-0 rounded-[14px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
