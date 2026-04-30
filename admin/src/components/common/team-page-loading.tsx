import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPageLoading() {
  return (
    <div className="w-full">
      <div className="relative w-full h-[250px]">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-2 right-2">
          <Skeleton className="w-[150px] h-[40px]" />
        </div>
      </div>

      <div className="w-[85%] px-4 pb-6 pt-3 ml-0 mr-auto">
        <div className="relative flex gap-2 mb-10">
          <div className="absolute -top-[4rem] left-4">
            <Skeleton className="w-[150px] h-[150px] rounded-full" />
          </div>

          <div className="flex flex-col items-start justify-between gap-3 pl-48">
            <Skeleton className="h-8 w-[120px] rounded-full" />
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-16 w-[400px]" />
            <Skeleton className="h-10 w-[180px] mt-4" />
          </div>
        </div>

        <div className="mt-6 ml-4 mr-auto">
          <div className="flex items-center justify-between mb-4 mt-6">
            <div className="flex items-center justify-center gap-4">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
            <Skeleton className="h-10 w-[150px]" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />

            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
