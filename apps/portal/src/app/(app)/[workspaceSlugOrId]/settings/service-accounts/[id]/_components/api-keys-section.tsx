"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/cn";
import type {
  ServiceAccount,
  ServiceAccountApiKey,
} from "@/lib/mock/types";
import { ResourceTable } from "@/app/(app)/_components/resource-table";
import {
  classifyExpiry,
  formatExpiresIn,
  formatShortDate,
} from "../../_components/format";
import CliLine from "../../_components/cli-line";
import DeleteServiceAccountApiKeyDialog from "./delete-service-account-api-key-dialog";

const columnHelper = createColumnHelper<ServiceAccountApiKey>();

interface ApiKeysSectionProps {
  serviceAccount: ServiceAccount;
  onCreateKey: () => void;
  onKeyDeleted: (keyId: string) => void;
}

export default function ApiKeysSection({
  serviceAccount,
  onCreateKey,
  onKeyDeleted,
}: ApiKeysSectionProps) {
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] =
    useState<ServiceAccountApiKey | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return serviceAccount.apiKeys;
    return serviceAccount.apiKeys.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.keyPrefix.toLowerCase().includes(q),
    );
  }, [serviceAccount.apiKeys, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="font-medium text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("keyPrefix", {
        header: "Key prefix",
        cell: (info) => (
          <code className="font-mono typography-code text-muted-foreground">
            {info.getValue()}
          </code>
        ),
        meta: { cellClassName: "w-[160px]" },
      }),
      columnHelper.accessor("expiresAt", {
        header: "Expires in",
        cell: (info) => {
          const cls = classifyExpiry(info.getValue());
          return (
            <span
              className={cn(
                cls === "expired" && "text-meta-foreground",
                cls === "near" && "text-state-warning-text",
                cls === "future" && "text-foreground",
                cls === "never" && "text-foreground",
              )}
            >
              {formatExpiresIn(info.getValue())}
            </span>
          );
        },
        meta: { cellClassName: "w-[120px]" },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created at",
        cell: (info) => (
          <span className="font-mono typography-code text-muted-foreground">
            {formatShortDate(info.getValue())}
          </span>
        ),
        meta: { cellClassName: "w-[130px]" },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <KeyRowMenu
            apiKey={row.original}
            onDelete={() => setPendingDelete(row.original)}
          />
        ),
        meta: { cellClassName: "w-[48px]" },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filtered as ServiceAccountApiKey[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasKeys = serviceAccount.apiKeys.length > 0;
  const showSearch = serviceAccount.apiKeys.length >= 5;

  return (
    <section
      aria-labelledby="sa-keys-heading"
      className="flex flex-col gap-4 border-t border-border pt-6"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="sa-keys-heading"
          className="typography-subtitle text-foreground"
        >
          API keys
        </h2>
        <p className="text-muted-foreground">
          API keys are long-lived access tokens that authenticate to Blaxel
          by API or CLI.
        </p>
      </div>

      {showSearch && (
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search keys…"
          leading={<Search aria-hidden="true" className="size-3.5" />}
          className="max-w-xs"
          aria-label="Search API keys"
        />
      )}

      {!hasKeys ? (
        <KeysZeroState
          serviceAccount={serviceAccount}
          onCreate={onCreateKey}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No matches"
          cta={
            <Button variant="ghost" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ResourceTable table={table} />
      )}

      <DeleteServiceAccountApiKeyDialog
        apiKey={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={(key) => {
          onKeyDeleted(key.id);
          setPendingDelete(null);
        }}
      />
    </section>
  );
}

interface KeysZeroStateProps {
  serviceAccount: ServiceAccount;
  onCreate: () => void;
}

function KeysZeroState({ serviceAccount, onCreate }: KeysZeroStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 rounded-md border border-border bg-card px-6 py-12"
    >
      <p className="typography-body text-foreground">
        No API keys. This service account authenticates with the client ID and
        secret in Details below.
      </p>
      <CliLine
        className="w-full max-w-2xl"
        command={`bl api-key create --service-account ${serviceAccount.name} --name prod-deploy-key`}
      />
      <Button variant="ghost" onClick={onCreate}>
        Create API key
      </Button>
    </div>
  );
}

interface KeyRowMenuProps {
  apiKey: ServiceAccountApiKey;
  onDelete: () => void;
}

function KeyRowMenu({ apiKey, onDelete }: KeyRowMenuProps) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Actions for ${apiKey.name}`}
          >
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={onDelete}
            className="text-destructive focus:text-destructive"
          >
            Delete API key
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
