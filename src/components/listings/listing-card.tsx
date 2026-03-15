import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice, truncateText } from "@/lib/utils";

interface ListingCardProps {
  id: string;
  title: string;
  description: string;
  maxPrice: number | null;
  condition: string;
  location: string | null;
  tags?: { name: string; slug: string }[];
  createdAt: string | Date;
}

export function ListingCard({
  id,
  title,
  description,
  maxPrice,
  condition,
  location,
  tags,
  createdAt,
}: ListingCardProps) {
  const timeAgo = getTimeAgo(new Date(createdAt));

  return (
    <Link href={`/listings/${id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg leading-tight mb-2">
            {truncateText(title, 80)}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {truncateText(description, 150)}
          </p>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="secondary">
              {maxPrice != null ? formatPrice(maxPrice) : "Open to offers"}
            </Badge>
            {condition !== "any" && (
              <Badge variant="outline">{condition.replace("_", " ")}</Badge>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 4).map((tag) => (
                <Badge key={tag.slug} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          {location && <span>{location}</span>}
          {location && <span className="mx-1">&middot;</span>}
          <span>{timeAgo}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
