export const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-3 mt-2">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-px bg-gray-100" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  </div>
);

export const PropertyDetailSkeleton = () => (
  <div className="animate-pulse max-w-7xl mx-auto px-4 py-8">
    <div className="h-96 bg-gray-200 rounded-2xl mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded" />
      </td>
    ))}
  </tr>
);

export const InboxSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);
