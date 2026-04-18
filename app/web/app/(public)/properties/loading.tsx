export default function Loading() {
  return (
    <main className="bg-[#e7f2db] min-h-screen pt-28 pb-16 px-4 md:px-12 animate-pulse">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 border-b border-gray-100 pb-8">
          <div className="space-y-3">
            <div className="w-80 h-12 bg-gray-200 rounded-2xl" />
            <div className="w-96 h-5 bg-gray-100 rounded-lg" />
          </div>
          <div className="hidden lg:block w-48 h-5 bg-gray-100 rounded-full mt-6" />
        </div>

        {/* Filter Suite Skeleton */}
        <div className="mb-10 space-y-4">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-14 bg-gray-200 rounded-2xl" />
              <div className="w-full md:w-32 h-14 bg-gray-100 rounded-2xl" />
              <div className="w-full md:w-44 h-14 bg-gray-100 rounded-2xl" />
           </div>
        </div>

        {/* Results Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 h-[450px] flex flex-col">
               <div className="h-56 w-full bg-gray-200" />
               <div className="p-6 space-y-4 flex-1">
                  <div className="w-3/4 h-7 bg-gray-200 rounded-lg" />
                  <div className="w-1/2 h-4 bg-gray-100 rounded-md" />
                  <div className="w-full h-20 bg-gray-50 rounded-2xl mt-4" />
                  <div className="w-full h-12 bg-gray-100 rounded-xl mt-auto" />
               </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
