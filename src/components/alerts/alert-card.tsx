"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface AlertCardProps {
  id: string;
  category?: { name: string } | null;
  keywords: string[];
  tags: { name: string }[];
  createdAt: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function AlertCard({ category, keywords, tags, createdAt, onEdit, onDelete }: AlertCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-2">
        {category && <p className="text-sm"><span className="font-medium">Category:</span> {category.name}</p>}
        {keywords.length > 0 && (
          <div>
            <span className="text-sm font-medium">Keywords: </span>
            {keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="mr-1 text-xs">{kw}</Badge>
            ))}
          </div>
        )}
        {tags.length > 0 && (
          <div>
            <span className="text-sm font-medium">Tags: </span>
            {tags.map((tag) => (
              <Badge key={tag.name} variant="outline" className="mr-1 text-xs">{tag.name}</Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Created {new Date(createdAt).toLocaleDateString()}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
        <Button size="sm" variant="outline" onClick={onDelete}>Delete</Button>
      </CardFooter>
    </Card>
  );
}
