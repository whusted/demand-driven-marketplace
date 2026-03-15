"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationThread } from "@/components/messages/conversation-thread";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Conversation {
  offerId: string;
  otherUserId: string;
  otherUserName: string;
  listingTitle: string;
}

export function MessagesPageContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(
    searchParams.get("offer") || null,
  );
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const myOffersRes = await fetch("/api/users/me/offers?limit=100");
      const convos: Conversation[] = [];

      if (myOffersRes.ok) {
        const { data: myOffers } = await myOffersRes.json();
        for (const offer of myOffers) {
          convos.push({
            offerId: offer.id,
            otherUserId: offer.listing?.buyerId || "",
            otherUserName: "Buyer",
            listingTitle: offer.listing?.title || "Listing",
          });
        }
      }

      setConversations(convos);
      setLoading(false);
    }
    init();
  }, [supabase]);

  const selected = conversations.find((c) => c.offerId === selectedOfferId);

  if (loading) return <div className="text-center py-12">Loading conversations...</div>;

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)]">
      <div className="w-80 shrink-0 overflow-y-auto border rounded-lg">
        <h2 className="p-3 font-semibold text-sm border-b">Conversations</h2>
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No conversations yet</p>
        ) : (
          conversations.map((convo) => (
            <button
              key={convo.offerId}
              onClick={() => setSelectedOfferId(convo.offerId)}
              className={cn(
                "w-full text-left p-3 border-b hover:bg-muted transition-colors",
                selectedOfferId === convo.offerId && "bg-muted",
              )}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{convo.otherUserName[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{convo.otherUserName}</p>
                  <p className="text-xs text-muted-foreground truncate">{convo.listingTitle}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <ConversationThread
            offerId={selected.offerId}
            currentUserId={currentUserId}
            otherUserName={selected.otherUserName}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation
          </div>
        )}
      </Card>
    </div>
  );
}
