import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ReviewCardProps {
  rating: number;
  comment: string | null;
  reviewer: { displayName: string | null; username: string; avatarUrl: string | null } | null;
  createdAt: string;
}

export function ReviewCard({ rating, comment, reviewer, createdAt }: ReviewCardProps) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const name = reviewer?.displayName || reviewer?.username || "Deleted User";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{name}</span>
          <span className="text-amber-500 text-sm">{stars}</span>
          <span className="text-xs text-muted-foreground ml-auto">{formatDate(createdAt)}</span>
        </div>
        {comment && <p className="text-sm text-muted-foreground">{comment}</p>}
      </CardContent>
    </Card>
  );
}
