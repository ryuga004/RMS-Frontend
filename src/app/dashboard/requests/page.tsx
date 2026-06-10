"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSentRequests, getIncomingRequests, approveTenancyRequest, rejectTenancyRequest } from "@/lib/api/tenancy";
import { getApiErrorMessage } from "@/lib/api";
import type { TenancyRequestResponse } from "@/types";
import { toast } from "sonner";
import { Send, Inbox, Check, X, Building2, User } from "lucide-react";
import Link from "next/link";

export default function RequestsPage() {
  const [sentRequests, setSentRequests] = useState<TenancyRequestResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<TenancyRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sent, incoming] = await Promise.all([
        getSentRequests(),
        getIncomingRequests()
      ]);
      setSentRequests(sent);
      setIncomingRequests(incoming);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (assetId: number, userId: number) => {
    try {
      await approveTenancyRequest(assetId, userId);
      toast.success("Tenancy request approved.");
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleReject = async (assetId: number, userId: number) => {
    try {
      await rejectTenancyRequest(assetId, userId);
      toast.success("Tenancy request rejected.");
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Tenancy Requests</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground animate-pulse">
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tenancy Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage outgoing tenancy requests and incoming requests for your assets.
        </p>
      </div>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
          <TabsTrigger value="incoming" className="data-[state=active]:bg-background">
            <Inbox className="w-4 h-4 mr-2" />
            Incoming ({incomingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-background">
            <Send className="w-4 h-4 mr-2" />
            Sent ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-6">
          {incomingRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center py-10">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <CardTitle className="text-xl">No incoming requests</CardTitle>
                <CardDescription>
                  When someone requests to rent your assets, they will appear here.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {incomingRequests.map((req) => (
                <Card key={`${req.assetId}-${req.requesterUserId}`} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center p-6 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-primary" />
                        <h4 className="text-lg font-semibold tracking-tight">{req.assetTitle}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Requested by <span className="font-medium text-foreground">{req.requesterName}</span></span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleApprove(req.assetId, req.requesterUserId)}
                      >
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                        onClick={() => handleReject(req.assetId, req.requesterUserId)}
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/item/${req.assetId}`}>View Asset</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center py-10">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <CardTitle className="text-xl">No sent requests</CardTitle>
                <CardDescription>
                  You haven't sent any tenancy requests yet.
                </CardDescription>
                <div className="pt-4">
                  <Button asChild variant="outline">
                    <Link href="/browse">Browse Assets</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sentRequests.map((req) => (
                <Card key={req.assetId} className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between p-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-primary" />
                        <CardTitle className="text-lg">{req.assetTitle}</CardTitle>
                      </div>
                      <CardDescription>
                        Sent on {new Date(req.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Pending Approval
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/item/${req.assetId}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
