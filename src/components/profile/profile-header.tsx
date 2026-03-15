import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ProfileHeaderProps {
  displayName: string | null;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  rating: string;
  ratingCount: number;
  createdAt: string;
}

export function ProfileHeader({
  displayName,
  username,
  bio,
  avatarUrl,
  location,
  rating,
  ratingCount,
  createdAt,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-16 w-16">
        {avatarUrl && <AvatarImage src={avatarUrl} />}
        <AvatarFallback className="text-xl">
          {(displayName || username)[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">{displayName || username}</h1>
        <p className="text-muted-foreground">@{username}</p>
        {bio && <p className="mt-2 text-sm">{bio}</p>}
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          {location && <span>{location}</span>}
          <span>{rating} rating ({ratingCount} reviews)</span>
          <span>Member since {formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
