"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="search"
        placeholder="Search wanted listings..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
