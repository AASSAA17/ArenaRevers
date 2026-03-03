import React from 'react';
import { Skeleton } from './ui/skeleton';

export function ArenaCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-6 w-3/4" />
        
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded-sm" />
          ))}
          <Skeleton className="h-4 w-8 ml-2" />
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

