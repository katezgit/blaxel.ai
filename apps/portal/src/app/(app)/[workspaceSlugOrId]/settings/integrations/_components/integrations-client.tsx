"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  Circle,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
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

type CategoryFilter = "all" | "enabled" | IntegrationCategory;
type TypeFilter = "all" | IntegrationCategory;

interface CategoryItem {
  value: CategoryFilter;
  label: string;
}

const CATEGORIES: ReadonlyArray<CategoryItem> = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Enabled" },
  { value: "model", label: "Model" },
  { value: "mcp-server", label: "MCP server" },
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

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Integration | null>(null);

  const categoryCounts = useMemo(() => {
    const out: Record<CategoryFilter, number> = {
      all: integrations.length,
      enabled: integrations.filter((i) => i.enabled).length,
      model: integrations.filter((i) => i.category === "model").length,
      "mcp-server": integrations.filter((i) => i.category === "mcp-server").length,
    };
    return out;
  }, [integrations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return integrations.filter((i) => {
      if (category === "enabled" && !i.enabled) return false;
      if (category !== "all" && category !== "enabled" && i.category !== category) {
        return false;
      }
      if (typeFilter !== "all" && i.category !== typeFilter) return false;
      if (q && !i.name.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [integrations, category, typeFilter, search]);

  // Stable `now` for the lifetime of the view — every row computes against the
  // same reference. Reloading the page (or remounting) re-anchors it. Matches
  // the logs-tab pattern; tied to mount, not to filter changes.
  const now = useMemo(() => Date.now(), []);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "status",
        header: () => <span className="sr-only">Status</span>,
        meta: { headerClassName: "w-8", cellClassName: "w-8 pr-0" },
        cell: ({ row }) => <StatusIcon integration={row.original} />,
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: () => <span>Name</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm" shape="square">
              <AvatarFallback>{row.original.logoInitial}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="truncate text-label font-medium text-foreground">
                  {row.original.name}
                </span>
                {row.original.comingSoon && (
                  <span className="rounded-sm bg-secondary-surface px-1.5 py-0.5 text-meta font-mono text-meta-foreground">
                    Coming soon
                  </span>
                )}
              </span>
              <span className="text-caption text-meta-foreground">
                {row.original.category === "model" ? "Model" : "MCP server"}
              </span>
            </div>
          </div>
        ),
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

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search integrations"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="max-w-xs"
          aria-label="Search integrations"
        />
        <div className="ml-auto flex items-center gap-2">
          {/* Category — segment at lg+, select below. Four segments at "MCP
              server" length need the full desktop row to look right; tablet
              widths squeeze them into a wrapped row that orphans the cluster.
              Stay on the Select pattern until we're past lg (1024). */}
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as CategoryFilter)}
          >
            <SelectTrigger
              aria-label="Filter integrations by category (compact)"
              className="w-40 lg:hidden"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label} ({categoryCounts[item.value] ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SegmentedControl
            value={category}
            onValueChange={(v) => setCategory(v as CategoryFilter)}
            aria-label="Filter integrations by category"
            className="hidden overflow-x-auto lg:inline-flex"
          >
            {CATEGORIES.map((item) => (
              <SegmentedControl.Item key={item.value} value={item.value}>
                <span>{item.label}</span>
                <span className="font-mono text-meta tabular-nums opacity-70">
                  {categoryCounts[item.value] ?? 0}
                </span>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as TypeFilter)}
          >
            <SelectTrigger aria-label="Filter by type" className="w-28">
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
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setCategory("all");
              }}
            >
              Clear search
            </Button>
          }
        />
      ) : (
        <IntegrationsTable
          table={table}
          renderRowExtra={(row) =>
            row.original.statusWarning ? (
              <WarningBand message={row.original.statusWarning} />
            ) : null
          }
        />
      )}

      <ConfigureIntegrationDrawer
        integration={active}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

function StatusIcon({ integration }: { integration: Integration }) {
  if (integration.statusWarning) {
    return (
      <AlertTriangle
        aria-label="Connection issue"
        className="size-4 text-state-warning"
      />
    );
  }
  if (integration.enabled) {
    return (
      <Check
        aria-label="Connected"
        className="size-4 text-state-scored"
      />
    );
  }
  return (
    <Circle
      aria-label="Not connected"
      className="size-4 text-meta-foreground"
    />
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
