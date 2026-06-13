"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAuditEvents } from "@/lib/api/reporting";
import type { AuditAction, AuditEvent, AuditSearchResponse, AuditType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/api";

type FiltersState = {
  eventId: string;
  type: AuditType | "ALL";
  userId: string;
  method: string;
  path: string;
  resourceId: string;
  action: AuditAction | "ALL";
  status: string;
  from: string;
  to: string;
  sortBy: "timestamp" | "receivedAt" | "status";
  sortDir: "asc" | "desc";
};

const DEFAULT_FILTERS: FiltersState = {
  eventId: "",
  type: "ALL",
  userId: "",
  method: "",
  path: "",
  resourceId: "",
  action: "ALL",
  status: "",
  from: "",
  to: "",
  sortBy: "timestamp",
  sortDir: "desc",
};

const auditTypes: Array<AuditType> = [
  "USER",
  "ASSET",
  "TENANCY_INVITATION",
  "TENANCY_REQUEST",
  "CATEGORY",
  "UNKNOWN",
];

const auditActions: Array<AuditAction> = ["CREATE", "UPDATE", "DELETE"];
const AUDIT_PAGE_SIZE_DEFAULT: number = 5;

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(AUDIT_PAGE_SIZE_DEFAULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuditSearchResponse | null>(null);
  const initialLoad = useRef(false);

  const totalPages = data?.totalPages ?? 0;

  const canPrev = page > 0;
  const canNext = totalPages > 0 && page < totalPages - 1;

  const pagesToShow = useMemo(() => {
    if (!totalPages) return [];
    const start = Math.max(0, page - 2);
    const end = Math.min(totalPages - 1, page + 2);
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }, [page, totalPages]);

  const fetchAudits = useCallback(
    async (targetPage = page, targetSize = size, overrideFilters?: FiltersState) => {
      setLoading(true);
      setError(null);
      const f = overrideFilters ?? filters;
      try {
      const response = await getAuditEvents({
        eventId: f.eventId || undefined,
        type: f.type === "ALL" ? undefined : f.type,
        userId: f.userId ? Number(f.userId) : undefined,
        method: f.method || undefined,
        path: f.path || undefined,
        resourceId: f.resourceId || undefined,
        action: f.action === "ALL" ? undefined : f.action,
        status: f.status ? Number(f.status) : undefined,
        from: f.from ? new Date(f.from).toISOString() : undefined,
        to: f.to ? new Date(f.to).toISOString() : undefined,
        page: targetPage,
        size: targetSize,
        sortBy: f.sortBy,
        sortDir: f.sortDir,
      });
      setData(response);
    } catch (err) {
      setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [filters, page, size],
  );

  useEffect(() => {
    if (initialLoad.current) return;
    initialLoad.current = true;
    fetchAudits(0, size, filters);
  }, [fetchAudits, filters, size]);

  function handleApply() {
    setPage(0);
    fetchAudits(0, size, filters);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
    setSize(AUDIT_PAGE_SIZE_DEFAULT);
    fetchAudits(0, AUDIT_PAGE_SIZE_DEFAULT, DEFAULT_FILTERS);
  }

  function renderStatusBadge(status: number) {
    if (status >= 200 && status < 300) return <Badge className="bg-emerald-500/15 text-emerald-600">Success</Badge>;
    if (status >= 400 && status < 500) return <Badge className="bg-amber-500/15 text-amber-600">Client</Badge>;
    if (status >= 500) return <Badge className="bg-rose-500/15 text-rose-600">Server</Badge>;
    return <Badge variant="outline">Info</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Search and review admin activity across the platform.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Event ID"
            value={filters.eventId}
            onChange={(e) => setFilters((prev) => ({ ...prev, eventId: e.target.value }))}
          />
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value as FiltersState["type"] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {auditTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
          />
          <Input
            placeholder="HTTP Method"
            value={filters.method}
            onChange={(e) => setFilters((prev) => ({ ...prev, method: e.target.value }))}
          />
          <Input
            placeholder="Path"
            value={filters.path}
            onChange={(e) => setFilters((prev) => ({ ...prev, path: e.target.value }))}
          />
          <Input
            placeholder="Resource ID"
            value={filters.resourceId}
            onChange={(e) => setFilters((prev) => ({ ...prev, resourceId: e.target.value }))}
          />
          <Select
            value={filters.action}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, action: value as FiltersState["action"] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              {auditActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Status"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          />
          <Input
            type="datetime-local"
            value={filters.from}
            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
          />
          <Input
            type="datetime-local"
            value={filters.to}
            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
          />
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value as FiltersState["sortBy"] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Timestamp</SelectItem>
              <SelectItem value="receivedAt">Received</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortDir}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, sortDir: value as FiltersState["sortDir"] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 lg:col-span-2">
            <Button onClick={handleApply} disabled={loading}>
              {loading ? "Loading..." : "Apply Filters"}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.length ? (
                data.items.map((event: AuditEvent) => (
                  <TableRow key={event.id}>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.type}</Badge>
                    </TableCell>
                    <TableCell>{event.action ?? "-"}</TableCell>
                    <TableCell>{event.userId ?? "-"}</TableCell>
                    <TableCell className="max-w-[280px] truncate" title={event.path}>
                      {event.path}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(event.status)}
                        <span className="text-xs text-muted-foreground">{event.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {loading ? "Loading audit logs..." : "No audit events found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {data?.items?.length ?? 0} of {data?.totalElements ?? 0}
            </div>
            <div className="flex items-center gap-3">
              <Input
                className="w-20"
                type="number"
                min={1}
                max={200}
                value={size}
                onChange={(e) => setSize(Math.min(Math.max(Number(e.target.value || 1), 1), 200))}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setPage(0);
                  fetchAudits(0, size, filters);
                }}
              >
                Set Page Size
              </Button>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={!canPrev ? "pointer-events-none opacity-50" : undefined}
                    onClick={() => {
                      if (!canPrev) return;
                      const newPage = page - 1;
                      setPage(newPage);
                      fetchAudits(newPage, size);
                    }}
                  />
                </PaginationItem>
                {pagesToShow.map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => {
                        setPage(p);
                        fetchAudits(p, size);
                      }}
                    >
                      {p + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    className={!canNext ? "pointer-events-none opacity-50" : undefined}
                    onClick={() => {
                      if (!canNext) return;
                      const newPage = page + 1;
                      setPage(newPage);
                      fetchAudits(newPage, size);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
