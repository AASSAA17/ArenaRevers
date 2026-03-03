import React from 'react';
import { Skeleton } from './ui/skeleton';
import { Card } from './Card';

export function BookingCardSkeleton() {
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#D9D9D9]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-[#D9D9D9]">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

