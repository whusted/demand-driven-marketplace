"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSend: (body: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [body, setBody] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    onSend(body.trim());
    setBody("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-3">
      <Input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !body.trim()} size="sm">
        Send
      </Button>
    </form>
  );
}
