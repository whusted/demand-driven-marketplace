import { Suspense } from "react";
import { MessagesPageContent } from "@/components/messages/messages-page-content";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}
