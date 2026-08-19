export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200 rounded-t-3xl"></div>
      <div className="p-4 text-center">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}
