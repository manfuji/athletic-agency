'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function SetupCompetitionCardSkeleton() {
  return (
    <div className="w-[85%] ml-6 p-4 mt-5 shadow-lg rounded-lg bg-white">
      {/* Card Header Skeleton */}
      <div className="px-4 pt-4">
        <Skeleton className="w-1/3 h-6" />
      </div>

      {/* Card Content Skeleton */}
      <div className="p-4">
        {/* Progress Bar Skeleton */}
        <Skeleton className="w-full h-2 mb-6" />

        {/* Setup Details Skeletons (5 steps) */}
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="w-full bg-transparent border-[1.6px] p-3 rounded-lg flex justify-between items-center mt-6"
            style={{ borderColor: '#CACFD8' }}
          >
            <div className="flex gap-4">
              <Skeleton className="w-[27px] h-[27px] rounded-full" />
              <div>
                <Skeleton className="w-40 h-5 mb-2" />
                <Skeleton className="w-60 h-4" />
              </div>
            </div>
            <Skeleton className="w-20 h-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
