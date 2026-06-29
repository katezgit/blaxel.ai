"use client";

import { useCallback, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/button";
import ManageTable from "@/app/(manage)/_components/manage-table";
import { ManagePageAction } from "@/app/(manage)/_components/manage-page-action";
import type { ApiKey } from "@/lib/mock/types";
import { orgApiKeyQueries } from "@/lib/query/org-api-keys";
import { queryKeys } from "@/lib/query/keys";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { CreateApiKeyDialog, type ExpirationOption } from "./create-api-key-dialog";
import { RevokeKeyButton } from "./revoke-key-button";
import { SaveApiKeyDialog } from "./save-api-key-dialog";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });

const KEY_PREFIX = "sk-bl-";
const KEY_BODY_LENGTH = 40;
const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Generate a `sk-bl-` + 40-char base62 random string. Scaffold-grade, not crypto-secure for prod. */
function generateApiKey(): string {
  const bytes = new Uint8Array(KEY_BODY_LENGTH);
  crypto.getRandomValues(bytes);
  let body = "";
  for (let i = 0; i < KEY_BODY_LENGTH; i++) {
    body += BASE62[bytes[i]! % BASE62.length];
  }
  return `${KEY_PREFIX}${body}`;
}

/** "sk-bl-<…>XY" — last two chars of the body; matches existing fixture masking. */
function maskApiKey(fullKey: string): string {
  const tail = fullKey.slice(-2);
  return `${KEY_PREFIX}…-${tail}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Resolve a UI expiration option to an ISO date string or null. */
function resolveExpiresAt(option: ExpirationOption, now: Date): string | null {
  const days: Record<ExpirationOption, number | null> = {
    none: null,
    "30d": 30,
    "90d": 90,
    "180d": 180,
    "1y": 365,
  };
  const offset = days[option];
  if (offset === null) return null;
  return new Date(now.getTime() + offset * DAY_MS).toISOString().slice(0, 10);
}

const columnHelper = createColumnHelper<ApiKey>();

export function ApiKeysClient() {
  const { accountId } = useCurrentTenancy();
  const queryClient = useQueryClient();
  const { data: keys } = useSuspenseQuery(orgApiKeyQueries.list(accountId));

  const [createOpen, setCreateOpen] = useState(false);
  // `null` doubles as the closed signal for the Save dialog; non-null = open with that key.
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Mutations update the cache directly because there's no real backend yet —
  // a real server would replace setQueryData with invalidateQueries.
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => id,
    onSuccess: (id) => {
      queryClient.setQueryData<ReadonlyArray<ApiKey>>(
        queryKeys.orgApiKeys(accountId),
        (prev) => (prev ?? []).filter((k) => k.id !== id),
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (entry: ApiKey) => entry,
    onSuccess: (entry) => {
      queryClient.setQueryData<ReadonlyArray<ApiKey>>(
        queryKeys.orgApiKeys(accountId),
        (prev) => [entry, ...(prev ?? [])],
      );
    },
  });

  const handleRevoke = useCallback(
    (id: string) => {
      revokeMutation.mutate(id);
    },
    [revokeMutation],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
        meta: { cellClassName: "font-mono typography-label" },
      }),
      columnHelper.accessor("masked", {
        header: "Key",
        cell: (info) => (
          <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-2 py-1 font-mono typography-caption text-muted-foreground">
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => DATE_FMT.format(new Date(info.getValue())),
        meta: { cellClassName: "font-mono typography-label text-muted-foreground" },
      }),
      columnHelper.accessor("expiresAt", {
        header: "Expires",
        cell: (info) => {
          const value = info.getValue();
          if (value) return DATE_FMT.format(new Date(value));
          return "Never";
        },
        meta: { cellClassName: "font-mono typography-label text-muted-foreground" },
      }),
      columnHelper.display({
        id: "actions",
        header: () => null,
        cell: (info) => (
          <RevokeKeyButton
            name={info.row.original.name}
            onRevoke={() => handleRevoke(info.row.original.id)}
          />
        ),
        meta: {
          headerClassName: "w-10",
          cellClassName: "text-right",
        },
      }),
    ],
    [handleRevoke],
  );

  const table = useReactTable({
    data: keys as ApiKey[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleGenerate = ({
    name,
    expiration,
  }: {
    name: string;
    expiration: ExpirationOption;
  }) => {
    const fullKey = generateApiKey();
    const now = new Date();
    const newKey: ApiKey = {
      id: `k_${now.getTime()}`,
      name,
      masked: maskApiKey(fullKey),
      createdAt: now.toISOString().slice(0, 10),
      expiresAt: resolveExpiresAt(expiration, now),
      lastUsedAt: null,
    };
    createMutation.mutate(newKey);
    setCreateOpen(false);
    setGeneratedKey(fullKey);
  };

  const handleSaveDialogChange = (open: boolean) => {
    if (!open) setGeneratedKey(null);
  };

  return (
    <>
      <ManagePageAction>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <PlusIcon aria-hidden="true" className="size-3.5" />
          Create New Key
        </Button>
      </ManagePageAction>
      <ManageTable table={table} bordered />
      <CreateApiKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onGenerate={handleGenerate}
      />
      <SaveApiKeyDialog
        open={generatedKey !== null}
        onOpenChange={handleSaveDialogChange}
        apiKey={generatedKey ?? ""}
      />
    </>
  );
}
