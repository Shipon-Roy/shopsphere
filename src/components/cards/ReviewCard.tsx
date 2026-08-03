import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IReview } from "@/types";
import { REVIEW_STATUS_CONFIG } from "@/constants";

interface ReviewCardProps {
  review: IReview;
  showProduct?: boolean;
  showStatus?: boolean;
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

const STATUS_VARIANT: Record<string, "warning" | "success" | "muted"> = {
  pending: "warning",
  approved: "success",
  hidden: "muted",
};

export function ReviewCard({ review, showStatus = false, className }: ReviewCardProps) {
  const statusConfig = REVIEW_STATUS_CONFIG[review.status];

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {review.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{review.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StarRating rating={review.rating} />
            {showStatus && (
              <Badge variant={STATUS_VARIANT[review.status] ?? "secondary"}>
                {statusConfig?.label ?? review.status}
              </Badge>
            )}
          </div>
        </div>

        {review.title && (
          <p className="font-semibold text-sm">{review.title}</p>
        )}
        {review.comment && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {review.comment}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
