import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-[1187px] mx-auto font-inter space-y-10 bg-white p-5 md:p-8 rounded-[8px]">
      <Skeleton className="max-w-[320px] rounded-[12px] h-[45px]" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 border-b p-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-[60%] md:w-[45%] h-5 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
