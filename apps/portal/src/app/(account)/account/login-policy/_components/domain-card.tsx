"use client";

import { useState } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useAccountState } from "@/lib/mock/account-context";
import type { DomainPolicy } from "@/lib/mock/account";

const METHOD_OPTIONS: ReadonlyArray<
  NonNullable<DomainPolicy["enforcedMethod"]>
> = ["Any", "Google", "GitHub", "Email"];

interface DomainCardProps {
  domain: DomainPolicy;
}

export function DomainCard({ domain }: DomainCardProps) {
  const { verifyDomain, removeDomain, setDomainMethod } = useAccountState();
  const [savedMethod, setSavedMethod] = useState(domain.enforcedMethod);
  const [pendingMethod, setPendingMethod] = useState(domain.enforcedMethod);
  const isVerified = domain.verification === "verified";
  const isDirty = pendingMethod !== savedMethod;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <header className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-body font-medium text-foreground">
          {domain.domain}
        </h3>
        {isVerified ? (
          <Badge variant="success" showDot>
            Verified
          </Badge>
        ) : (
          <Badge variant="warning" showDot>
            Pending verification
          </Badge>
        )}
      </header>

      {isVerified ? (
        <div className="flex flex-col gap-3">
          <p className="text-caption text-muted-foreground">
            Users on this domain must sign in with{" "}
            <span className="font-medium text-foreground">
              {savedMethod ?? "Any"}
            </span>
            .
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5 text-label">
              <span className="text-muted-foreground">Enforce login method</span>
              <Select
                value={pendingMethod ?? "Any"}
                onValueChange={(value) =>
                  setPendingMethod(
                    value as NonNullable<DomainPolicy["enforcedMethod"]>,
                  )
                }
              >
                <SelectTrigger className="w-48" aria-label="Enforce login method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="primary"
              disabled={!isDirty}
              onClick={() => {
                if (pendingMethod) {
                  setDomainMethod(domain.id, pendingMethod);
                  setSavedMethod(pendingMethod);
                }
              }}
            >
              Save
            </Button>
            <Button
              variant="destructive-ghost"
              onClick={() => removeDomain(domain.id)}
            >
              Remove domain
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-caption text-muted-foreground">
            Verify domain ownership via DNS TXT record.
          </p>
          <div className="grid grid-cols-[6rem_1fr_auto] items-center gap-2 rounded-md border border-border bg-secondary-surface px-3 py-2 font-mono text-caption">
            <span className="text-muted-foreground">Type</span>
            <span className="text-foreground">TXT</span>
            <span />
            <span className="text-muted-foreground">Name</span>
            <span className="text-foreground">@</span>
            <span />
            <span className="text-muted-foreground">Value</span>
            <span className="truncate text-foreground">{domain.txtRecord}</span>
            <CopyButton value={domain.txtRecord} tooltipLabel="Copy TXT value" />
          </div>
          <p className="text-caption text-meta-foreground">
            DNS changes can take up to 48 hours to propagate.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => verifyDomain(domain.id)}
            >
              Verify now
            </Button>
            <Button
              variant="destructive-ghost"
              onClick={() => removeDomain(domain.id)}
            >
              Remove domain
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
