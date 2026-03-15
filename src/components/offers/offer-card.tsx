"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPrice, truncateText } from "@/lib/utils";

interface OfferCardProps {
  id: string;
  price: number;
  condition: string;
  description: string;
  status: string;
  images?: { url: string }[];
  seller?: { displayName: string | null; username: string; rating: string; avatarUrl: string | null };
  listingMaxPrice?: number | null;
  listingTitle?: string;
  role: "buyer" | "seller";
  onAccept?: () => void;
  onDecline?: () => void;
  onWithdraw?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
}

export function OfferCard({
  price,
  condition,
  description,
  status,
  images,
  seller,
  listingMaxPrice,
  listingTitle,
  role,
  onAccept,
  onDecline,
  onWithdraw,
  onMessage,
  onClick,
}: OfferCardProps) {
  const exceedsBudget = listingMaxPrice != null && price > listingMaxPrice;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        {/* Image thumbnail */}
        {images && images.length > 0 && (
          <div className="flex gap-1 mb-3 overflow-hidden">
            {images.slice(0, 3).map((img, i) => (
              <div key={i} className="h-16 w-16 rounded bg-muted overflow-hidden shrink-0">
                <img src={img.url} alt="" className="object-cover w-full h-full" />
              </div>
            ))}
            {images.length > 3 && (
              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{images.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Listing title (seller view) */}
        {listingTitle && (
          <p className="text-xs text-muted-foreground mb-1 truncate">{listingTitle}</p>
        )}

        {/* Price and status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-lg">{formatPrice(price)}</span>
          {exceedsBudget && (
            <Badge variant="destructive" className="text-xs">Over budget</Badge>
          )}
          <Badge variant={status === "accepted" ? "default" : "secondary"} className="ml-auto text-xs">
            {status}
          </Badge>
        </div>

        {/* Condition */}
        <Badge variant="outline" className="mb-2">{condition.replace("_", " ")}</Badge>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{truncateText(description, 120)}</p>

        {/* Seller info (buyer view) */}
        {seller && role === "buyer" && (
          <div className="flex items-center gap-2 mt-3">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {(seller.displayName || seller.username)?.[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{seller.displayName || seller.username}</span>
            <span className="text-xs text-muted-foreground">{seller.rating} rating</span>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="gap-2" onClick={(e) => e.stopPropagation()}>
        {status === "pending" && role === "buyer" && onAccept && (
          <Button size="sm" onClick={onAccept}>Accept</Button>
        )}
        {status === "pending" && role === "buyer" && onDecline && (
          <Button size="sm" variant="outline" onClick={onDecline}>Decline</Button>
        )}
        {status === "pending" && role === "seller" && onWithdraw && (
          <Button size="sm" variant="outline" onClick={onWithdraw}>Withdraw</Button>
        )}
        {onMessage && (
          <Button size="sm" variant="outline" onClick={onMessage}>Message</Button>
        )}
      </CardFooter>
    </Card>
  );
}
