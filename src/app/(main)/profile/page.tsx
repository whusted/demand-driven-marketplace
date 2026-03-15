"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function OwnProfilePage() {
  const [profile, setProfile] = useState<Record<string, string | number | null> | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch_() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const { data } = await res.json();
        setProfile(data);
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
      }
      setLoading(false);
    }
    fetch_();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, location }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!profile) return <div className="text-center py-12">Not logged in</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {(displayName || (profile.username as string))?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">@{profile.username as string}</p>
              <p className="text-sm text-muted-foreground">{profile.email as string}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
