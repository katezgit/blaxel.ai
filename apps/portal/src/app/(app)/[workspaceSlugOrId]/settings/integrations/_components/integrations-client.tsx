"use client";

import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink, Search } from "lucide-react";
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

export function IntegrationsClient() {
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
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
        <ul
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Available integrations"
        >
          {filtered.map((integration) => (
            <li key={integration.id}>
              <IntegrationCard
                integration={integration}
                isActive={active?.id === integration.id}
                onConfigure={() => setActive(integration)}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfigureIntegrationDrawer
        integration={active}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

interface IntegrationCardProps {
  integration: Integration;
  isActive: boolean;
  onConfigure: () => void;
}

function IntegrationCard({
  integration,
  isActive,
  onConfigure,
}: IntegrationCardProps) {
  const disabled = integration.comingSoon;
  const typeLabel = integration.category === "model" ? "Model" : "MCP server";
  return (
    <Card
      variant={disabled ? "default" : "interactive"}
      className={cn(
        "group flex h-full flex-col gap-3 p-4",
        disabled && "cursor-not-allowed opacity-60",
        !disabled && "cursor-pointer",
        // Selected state: this card's drawer is the open one. Border picks up the
        // brand colour and a tint backs the surface so the link between card and
        // drawer is unambiguous even when the grid scrolls.
        isActive && "border-primary bg-primary/5 ring-1 ring-primary/30",
      )}
      // Card is a drawer trigger, not a toggle. aria-haspopup advertises the
      // dialog destination; aria-expanded reflects whether *this* card's drawer
      // is the currently-open one. aria-pressed would lie ("on/off toggle").
      aria-disabled={disabled || undefined}
      aria-haspopup={disabled ? undefined : "dialog"}
      aria-expanded={disabled ? undefined : isActive}
      role={disabled ? "article" : "button"}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onConfigure}
      onKeyDown={
        disabled
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onConfigure();
              }
            }
      }
      aria-label={
        disabled
          ? `${integration.name} — coming soon, not yet available`
          : `Configure ${integration.name}`
      }
    >
      <div className="flex items-start gap-3">
        <Avatar size="md" shape="square">
          <AvatarFallback>{integration.logoInitial}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-medium text-foreground">
              {integration.name}
            </span>
            {integration.comingSoon && (
              <span className="rounded-sm bg-secondary-surface px-1.5 py-0.5 text-caption font-mono text-meta-foreground">
                Coming soon
              </span>
            )}
            {integration.enabled && !integration.comingSoon && (
              <span className="rounded-sm bg-state-scored/10 px-1.5 py-0.5 text-caption font-mono text-state-scored">
                Connected
              </span>
            )}
          </div>
          <span className="text-caption text-meta-foreground">{typeLabel}</span>
        </div>
      </div>
      <p className="line-clamp-2 flex-1 text-caption text-muted-foreground">
        {integration.description}
      </p>
      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-caption text-meta-foreground">
          {integration.usedByCount
            ? `${integration.usedByCount} service account${integration.usedByCount === 1 ? "" : "s"}`
            : "Not connected"}
        </span>
        {!disabled && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-caption font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-meta-foreground group-hover:text-primary group-focus-visible:text-primary",
            )}
            aria-hidden="true"
          >
            {isActive ? "Configuring" : "Configure"}
            <ArrowRight
              className={cn(
                "size-3 transition-transform",
                isActive ? "translate-x-0.5" : "group-hover:translate-x-0.5",
              )}
            />
          </span>
        )}
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
                className="inline-flex items-center gap-1 text-caption text-primary hover:underline"
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
