"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageInput } from "@/components/messages/message-input";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  senderId: string;
  body: string;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

interface ConversationThreadProps {
  offerId: string;
  currentUserId: string;
  otherUserName: string;
}

export function ConversationThread({
  offerId,
  currentUserId,
  otherUserName,
}: ConversationThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/offers/${offerId}/messages`);
    if (res.ok) {
      const { data } = await res.json();
      setMessages(data);
    }
    setLoading(false);
  }, [offerId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${offerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `offer_id=eq.${offerId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [offerId, supabase]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(body: string, imageUrl?: string) {
    const res = await fetch(`/api/offers/${offerId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, imageUrl }),
    });

    if (res.ok) {
      const { data } = await res.json();
      // Add optimistically (realtime will also fire but we dedupe by checking id)
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  }

  if (loading) return <div className="text-center py-8">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            body={msg.body}
            imageUrl={msg.imageUrl}
            senderName={msg.senderId === currentUserId ? "You" : otherUserName}
            isCurrentUser={msg.senderId === currentUserId}
            readAt={msg.readAt}
            createdAt={msg.createdAt}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
