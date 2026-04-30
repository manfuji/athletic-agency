import { Skeleton } from "../ui/skeleton";

export default function Loading() {
  return (
    <div className="font-inter mt-4">
      <div className="flex justify-end">
        <Skeleton className="w-[30%] h-2.5  text-xs sm:text-base 2xl:text-sm text-gray-500 " />
      </div>
      <div className="mt-4 space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="w-full flex items-center gap-x-2">
              <Skeleton className="w-11 h-11 md:w-16 md:h-16 2xl:w-11 2xl:h-11 rounded-full" />
              <Skeleton className="w-[40%] h-2.5  text-xs sm:text-base 2xl:text-sm text-gray-500 " />
            </div>
            <Skeleton className="w-[10%] h-2.5  text-xs sm:text-base 2xl:text-sm text-gray-500 " />
          </div>
        ))}
      </div>
    </div>
  );
}
