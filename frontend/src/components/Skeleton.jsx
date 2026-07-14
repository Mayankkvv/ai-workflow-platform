export function SkeletonLine({ className = "" }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export function WorkflowCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <SkeletonLine className="h-4 w-2/3 mb-3" />
      <SkeletonLine className="h-3 w-full mb-2" />
      <SkeletonLine className="h-3 w-1/3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <WorkflowCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ExecutionRowSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
      <SkeletonLine className="h-5 w-16" />
      <SkeletonLine className="h-4 w-40" />
    </div>
  );
}

export function ExecutionHistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <ExecutionRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function IntegrationRowSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className="h-7 w-20" />
    </div>
  );
}

export function IntegrationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <IntegrationRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-3 px-8">
        <SkeletonLine className="h-4 w-1/2 mx-auto" />
        <SkeletonLine className="h-3 w-2/3 mx-auto" />
      </div>
    </div>
  );
}