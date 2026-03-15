"use client";

import { useEffect, useState } from "react";
import { AlertCard } from "@/components/alerts/alert-card";
import { AlertForm } from "@/components/alerts/alert-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AlertData {
  id: string;
  keywords: string[];
  tags: { name: string }[];
  category: { name: string } | null;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchAlerts() {
    const res = await fetch("/api/alerts");
    if (res.ok) {
      const { data } = await res.json();
      setAlerts(data);
    }
    setLoading(false);
  }

  useEffect(() => { fetchAlerts(); }, []);

  async function handleDelete(alertId: string) {
    const res = await fetch(`/api/alerts/${alertId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Alert deleted");
      fetchAlerts();
    } else {
      toast.error("Failed to delete alert");
    }
  }

  if (loading) return <div className="text-center py-12">Loading alerts...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seller Alerts</h1>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Create New Alert
          </Button>
        )}
      </div>

      {showForm && (
        <AlertForm
          mode="create"
          onSuccess={() => { setShowForm(false); fetchAlerts(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {alerts.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No alerts yet</p>
          <p>Create an alert to get notified when matching listings are posted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              id={alert.id}
              category={alert.category}
              keywords={alert.keywords}
              tags={alert.tags}
              createdAt={alert.createdAt}
              onEdit={() => {/* TODO: inline edit */}}
              onDelete={() => handleDelete(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
