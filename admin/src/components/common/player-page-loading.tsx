import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerPageLoading() {
  return (
    <div className="w-[85%] px-4 py-6 ml-10 mr-auto">
      <div className="flex justify-center">
        <Skeleton className="w-[184px] h-[184px] rounded-lg" />
      </div>

      <div className="mt-4 flex justify-center">
        <Skeleton className="h-8 w-[200px]" />
      </div>

      <div className="flex justify-center gap-4 mt-2">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px] rounded-full" />
      </div>

      <div className="flex justify-center my-6">
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 ml-0 mr-auto">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-[100px] w-full" />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-[60px] w-full" />
        ))}
      </div>
    </div>
  );
}
