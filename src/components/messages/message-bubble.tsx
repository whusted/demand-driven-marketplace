import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  body: string;
  imageUrl?: string | null;
  senderName: string;
  isCurrentUser: boolean;
  readAt?: string | null;
  createdAt: string;
}

export function MessageBubble({
  body,
  imageUrl,
  senderName,
  isCurrentUser,
  readAt,
  createdAt,
}: MessageBubbleProps) {
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex gap-2 max-w-[80%]", isCurrentUser ? "ml-auto flex-row-reverse" : "")}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="text-xs">{senderName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {imageUrl && (
            <img src={imageUrl} alt="" className="max-w-[200px] rounded mb-1" />
          )}
          <p className="whitespace-pre-wrap">{body}</p>
        </div>
        <div className={cn("flex gap-1 mt-0.5 text-[10px] text-muted-foreground", isCurrentUser ? "justify-end" : "")}>
          <span>{time}</span>
          {isCurrentUser && readAt && <span>· Read</span>}
        </div>
      </div>
    </div>
  );
}
