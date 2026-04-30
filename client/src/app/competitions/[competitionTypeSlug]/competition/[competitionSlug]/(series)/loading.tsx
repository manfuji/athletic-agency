import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-3 max-w-[1187px]">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-y-5 bg-white border border-gray-300 rounded-[4.41px] py-4 px-2"
        >
          <Skeleton className="w-full rounded-[4.41px] min-h-[245.31px] md:h-[468px]" />
          <div className="flex flex-col gap-y-3">
            <div className="flex gap-x-6">
              <Skeleton className=" w-28 h-4 px-2 py-1 rounded-full" />
              <Skeleton className=" w-28 h-4 px-2 py-1 rounded-full" />
            </div>

            <Skeleton className=" h-8 md:h-10 px-2 py-1 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
