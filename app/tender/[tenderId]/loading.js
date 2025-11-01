// Simple loading spinner component
function Spinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function Loading() {
  // You can make a full page skeleton here
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
        </div>
      </div>
      <Spinner />
    </div>
  );
}
