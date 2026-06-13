"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyInvitations, acceptInvitation, rejectInvitation } from "@/lib/api/tenancy";
import { getApiErrorMessage } from "@/lib/api";
import type { TenancyInvitationResponse } from "@/types";
import { toast } from "sonner";
import { Mail, Check, X } from "lucide-react";

export default function InvitationsPage() {
  const [list, setList] = useState<TenancyInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await getMyInvitations();
      setList(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (assetId: number) => {
    try {
      await acceptInvitation(assetId);
      toast.success("Invitation accepted.");
      fetchInvitations();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleReject = async (assetId: number) => {
    try {
      await rejectInvitation(assetId);
      toast.success("Invitation rejected.");
      fetchInvitations();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Tenancy Invitations</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tenancy Invitations</h1>
        <p className="text-muted-foreground">
          Accept or reject invitations to rent an asset.
        </p>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardHeader>
            <Mail className="h-10 w-10 text-muted-foreground" />
            <CardTitle>No invitations</CardTitle>
            <CardDescription>
              When an owner sends you a tenancy invitation, it will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((inv) => (
            <Card key={inv.assetId}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{inv.assetTitle}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </span>
              </CardHeader>
              <CardContent className="flex flex-row items-center gap-2">
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleAccept(inv.assetId)}
                >
                  <Check className="h-4 w-4" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => handleReject(inv.assetId)}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/browse/${inv.assetId}`}>View asset</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
