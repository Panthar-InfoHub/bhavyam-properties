export default function Loading() {
  return (
    <main className="bg-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Skeleton Left Column */}
        <div className="flex-1 w-full lg:w-[60%] flex flex-col gap-6">
           <div className="w-full aspect-[4/3] rounded-3xl bg-gray-200 animate-pulse"></div>
           <div className="w-3/4 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
           <div className="w-1/2 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
           <div className="space-y-3 mt-4">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse"></div>
           </div>
        </div>
        {/* Skeleton Right Column */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
           <div className="grid grid-cols-2 gap-3">
             <div className="aspect-[4/5] rounded-2xl bg-gray-200 animate-pulse"></div>
             <div className="aspect-[4/5] rounded-2xl bg-gray-200 animate-pulse"></div>
           </div>
           <div className="w-full h-64 bg-gray-200 rounded-3xl animate-pulse mt-4"></div>
           <div className="w-full h-80 bg-gray-100 rounded-3xl animate-pulse mt-4"></div>
        </div>
      </div>
    </main>
  );
}
