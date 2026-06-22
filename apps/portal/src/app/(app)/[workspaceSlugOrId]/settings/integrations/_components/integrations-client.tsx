"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { EmptyState } from "@repo/ui/components/empty-state";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import { cn } from "@repo/ui/lib/cn";
import type { Integration, IntegrationCategory } from "@/lib/mock/types";
import { workspaceIntegrationQueries } from "@/lib/query/workspace-integrations";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import IntegrationsTable from "./integrations-table";

type StatusFilter = "all" | "enabled";
type TypeFilter = "all" | IntegrationCategory;

interface StatusItem {
  value: StatusFilter;
  label: string;
}

// Two-axis filter IA: status segment (binary) + type dropdown (extensible).
// New integration categories extend the dropdown only — the segment never grows.
const STATUS_FILTERS: ReadonlyArray<StatusItem> = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Enabled" },
];

const TYPE_OPTIONS: ReadonlyArray<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "All types" },
  { value: "model", label: "Model" },
  { value: "mcp-server", label: "MCP server" },
];

const columnHelper = createColumnHelper<Integration>();

export default function IntegrationsClient() {
  const { accountId, workspaceId } = useCurrentTenancy();
  const { data: integrations } = useSuspenseQuery(
    workspaceIntegrationQueries.list(accountId, workspaceId),
  );

  const [status, setStatus] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Integration | null>(null);

  // Counts respect the current type-filter so the segment numbers reflect what
  // the table actually shows when the user toggles between All / Enabled.
  const statusCounts = useMemo(() => {
    const typeScoped = integrations.filter(
      (i) => typeFilter === "all" || i.category === typeFilter,
    );
    return {
      all: typeScoped.length,
      enabled: typeScoped.filter((i) => i.enabled).length,
    } satisfies Record<StatusFilter, number>;
  }, [integrations, typeFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return integrations.filter((i) => {
      if (status === "enabled" && !i.enabled) return false;
      if (typeFilter !== "all" && i.category !== typeFilter) return false;
      if (q && !i.name.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [integrations, status, typeFilter, search]);

  // Stable `now` for the lifetime of the view — every row computes against the
  // same reference. Reloading the page (or remounting) re-anchors it. Matches
  // the logs-tab pattern; tied to mount, not to filter changes.
  const now = useMemo(() => Date.now(), []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: () => <span>Name</span>,
        cell: ({ row }) => <NameCell integration={row.original} />,
      }),
      columnHelper.accessor("description", {
        id: "description",
        header: () => <span>Description</span>,
        meta: {
          cellClassName:
            "text-caption text-muted-foreground max-w-[28rem] whitespace-normal",
        },
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("usedByCount", {
        id: "serviceAccounts",
        header: () => <span>Service accounts</span>,
        meta: { cellClassName: "text-meta-foreground tabular-nums" },
        cell: ({ row }) => {
          const count = row.original.usedByCount ?? 0;
          if (!row.original.enabled) {
            return <span className="text-meta-foreground">—</span>;
          }
          return (
            <span>
              {count} {count === 1 ? "account" : "accounts"}
            </span>
          );
        },
      }),
      columnHelper.accessor("lastActivityAt", {
        id: "lastActivity",
        header: () => <span>Last activity</span>,
        meta: { cellClassName: "text-meta-foreground" },
        cell: ({ row }) => {
          const iso = row.original.lastActivityAt;
          if (!iso) return <span className="text-meta-foreground">—</span>;
          return <span>{formatRelativeTime(iso, now)}</span>;
        },
      }),
      columnHelper.display({
        id: "action",
        header: () => <span className="sr-only">Action</span>,
        meta: { headerClassName: "w-32", cellClassName: "w-32 text-right" },
        cell: ({ row }) => (
          <RowAction
            integration={row.original}
            onActivate={() => setActive(row.original)}
          />
        ),
      }),
    ],
    [now],
  );

  const table = useReactTable({
    data: filtered as Integration[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const onClearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatus("all");
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search integrations"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="max-w-xs"
          aria-label="Search integrations"
        />
        <div className="ml-auto flex items-center gap-2">
          <SegmentedControl
            value={status}
            onValueChange={(v) => setStatus(v as StatusFilter)}
            aria-label="Filter integrations by status"
          >
            {STATUS_FILTERS.map((item) => (
              <SegmentedControl.Item key={item.value} value={item.value}>
                <span>{item.label}</span>
                <span className="font-mono text-meta tabular-nums opacity-70">
                  {statusCounts[item.value]}
                </span>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as TypeFilter)}
          >
            <SelectTrigger aria-label="Filter by type" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No integrations match"
          subtitle="Try a different search or clear the filters."
          cta={
            <Button variant="secondary" onClick={onClearFilters}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          {/* Table at md+; card list below md. Two structurally different
              renderings of the same filtered data, switched by responsive
              visibility — keeps each layout's markup honest instead of
              jamming a layout prop through one component. */}
          <div className="hidden min-h-0 flex-1 md:flex md:flex-col">
            <IntegrationsTable
              table={table}
              getRowClassName={(row) =>
                row.original.statusWarning
                  ? "bg-state-warning-subtle border-l-2 border-l-state-warning hover:bg-state-warning-subtle"
                  : undefined
              }
              renderRowExtra={(row) =>
                row.original.statusWarning ? (
                  <WarningBand message={row.original.statusWarning} />
                ) : null
              }
            />
          </div>
          <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto md:hidden" role="list">
            {filtered.map((integration) => (
              <li key={integration.id}>
                <IntegrationCard
                  integration={integration}
                  now={now}
                  onActivate={() => setActive(integration)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfigureIntegrationDrawer
        integration={active}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

function NameCell({ integration }: { integration: Integration }) {
  // Connected-state indicator: filled green dot inline with the name. Only
  // appears for healthy connected rows — the warning row carries its own
  // amber treatment, so a green dot there would conflict with the band.
  const showConnectedDot = integration.enabled && !integration.statusWarning;
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm" shape="square">
        <AvatarFallback>{integration.logoInitial}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          {showConnectedDot && (
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-state-scored"
            />
          )}
          <span className="truncate text-body text-foreground">
            {integration.name}
          </span>
          {integration.comingSoon && (
            <span className="rounded-sm bg-secondary-surface px-1.5 py-0.5 text-meta font-mono text-meta-foreground">
              Coming soon
            </span>
          )}
        </span>
        <span className="text-meta text-meta-foreground">
          {integration.category === "model" ? "Model" : "MCP server"}
        </span>
      </div>
    </div>
  );
}

interface RowActionProps {
  integration: Integration;
  onActivate: () => void;
}

function RowAction({ integration, onActivate }: RowActionProps) {
  if (integration.comingSoon) {
    return (
      <Button variant="secondary" disabled aria-label={`${integration.name} — coming soon`}>
        Connect
      </Button>
    );
  }
  if (integration.enabled) {
    return (
      <Button variant="ghost" onClick={onActivate}>
        Configure
      </Button>
    );
  }
  return (
    <Button variant="secondary" onClick={onActivate}>
      Connect
    </Button>
  );
}

function WarningBand({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-caption text-state-warning-text">
      <AlertTriangle
        aria-hidden="true"
        className="mt-0.5 size-3.5 shrink-0 text-state-warning"
      />
      <span>{message}</span>
    </div>
  );
}

interface IntegrationCardProps {
  integration: Integration;
  now: number;
  onActivate: () => void;
}

function IntegrationCard({ integration, now, onActivate }: IntegrationCardProps) {
  const metaLine = formatCardMeta(integration, now);

  return (
    <Card
      variant="elevated"
      className={cn(
        "flex flex-col gap-3 p-4",
        integration.statusWarning &&
          "border-l-2 border-l-state-warning bg-state-warning-subtle",
      )}
    >
      <NameCell integration={integration} />
      <p className="text-caption text-muted-foreground">
        {integration.description}
      </p>
      {integration.statusWarning && (
        <WarningBand message={integration.statusWarning} />
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-meta-foreground">{metaLine}</span>
        <RowAction integration={integration} onActivate={onActivate} />
      </div>
    </Card>
  );
}

interface ConfigureIntegrationDrawerProps {
  integration: Integration | null;
  onClose: () => void;
}

function ConfigureIntegrationDrawer({
  integration,
  onClose,
}: ConfigureIntegrationDrawerProps) {
  const open = integration !== null;
  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DrawerContent size="md" aria-describedby={undefined}>
        {integration && (
          <>
            <DrawerHeader className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Avatar size="md" shape="square">
                  <AvatarFallback>{integration.logoInitial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <DrawerTitle className="text-subtitle">
                    {integration.enabled ? "Configure" : "Connect"}{" "}
                    {integration.name}
                  </DrawerTitle>
                  <DrawerDescription className="text-muted-foreground">
                    {integration.description}
                  </DrawerDescription>
                </div>
              </div>
              <DrawerCloseButton />
            </DrawerHeader>

            <DrawerBody className="flex flex-col gap-4">
              <FormField
                id={`${integration.id}-name`}
                label="Name"
                helper="Identifier for this integration instance. Cannot be changed after creation."
              >
                <Input
                  defaultValue={`${integration.id}-${randomSuffix()}`}
                  className="font-mono"
                />
              </FormField>
              <FormField
                id={`${integration.id}-endpoint`}
                label={
                  integration.category === "model"
                    ? "Base URL"
                    : `${integration.name} Base URL`
                }
                helper={`Default: https://api.${integration.id}.com`}
              >
                <Input placeholder={`https://api.${integration.id}.com`} />
              </FormField>
              <FormField
                id={`${integration.id}-api-key`}
                label="API key"
                helper="Stored in the workspace credential vault. Rotate any time from this drawer."
              >
                <Input
                  type="password"
                  placeholder="sk_…"
                  className="font-mono"
                />
              </FormField>
              <a
                href={`https://docs.blaxel.ai/integrations/${integration.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 text-caption text-primary hover:underline",
                )}
              >
                Get your API key
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </DrawerBody>

            <DrawerFooter className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.success(
                    integration.enabled
                      ? `${integration.name} integration updated.`
                      : `${integration.name} integration created.`,
                  );
                  onClose();
                }}
              >
                {integration.enabled ? "Save changes" : "Create"}
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

// Card-meta line condenses the two table columns ("Service accounts" + "Last
// activity") into a single muted line. Disabled integrations have no use count
// and may have no activity timestamp — em-dash when both are absent.
function formatCardMeta(integration: Integration, now: number): string {
  const parts: string[] = [];
  if (integration.enabled) {
    const used = integration.usedByCount ?? 0;
    parts.push(`${used} ${used === 1 ? "account" : "accounts"}`);
  }
  if (integration.lastActivityAt) {
    parts.push(formatRelativeTime(integration.lastActivityAt, now));
  }
  if (parts.length === 0) return "—";
  return parts.join(" · ");
}

// Compact relative-time formatter; identical shape to the logs-tab helper.
// Local because integrations live on a different route and the model-apis
// helper is colocated with its route's components.
function formatRelativeTime(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const diffMs = now - then;
  if (diffMs < 60_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr${years === 1 ? "" : "s"} ago`;
}
