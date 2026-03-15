"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link href="/listings" className="text-xl font-bold shrink-0">
          WantedBoard
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search wanted listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <nav className="flex items-center gap-2">
          <Link href="/listings" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Browse
          </Link>
          <Link href="/offers" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            My Offers
          </Link>
          <Link href="/alerts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Alerts
          </Link>
          <Link href="/messages" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Messages
          </Link>
          <Link href="/notifications" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Notifications
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
