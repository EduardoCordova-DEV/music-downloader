import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const MusicCardSkeleton = () => {
  return (
    <Card className="p-6 space-y-4 bg-card border-border">
      <div className="flex gap-4">
        <Skeleton className="h-32 w-32 rounded-md" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
    </Card>
  )
}
