'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function CompetitionCardSkeleton() {
  return (
    <div className="flex bg-white shadow-md p-6 mb-4 rounded-lg">
      {/* Banner Image Skeleton */}
      <Skeleton className="w-[250px] h-[250px] mr-6 flex-shrink-0 rounded-lg" />

      {/* Content */}
      <div className="flex-1">
        {/* Category Tag */}
        <Skeleton className="w-20 h-6 rounded-full mb-2" />

        {/* Title Skeleton */}
        <Skeleton className="w-3/4 h-8 mt-2" />

        {/* Description */}
        <Skeleton className="w-full h-4 mt-2" />
        <Skeleton className="w-5/6 h-4 mt-1" />
        <Skeleton className="w-2/3 h-4 mt-1 mb-8" />

        {/* Location and Date */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 mr-1" />
            <Skeleton className="w-24 h-4" />
          </div>
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 mr-1" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>

        {/* Button */}
        <Skeleton className="w-full h-10 mt-8 rounded-md" />
      </div>
    </div>
  );
}
