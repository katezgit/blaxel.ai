"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@repo/ui/components/table";
import type { SandboxSettings } from "@/lib/mock/sandbox-settings-fixtures";
import BandFrame from "./band-frame";

interface SandboxSettingsResourcesProps {
  settings: SandboxSettings;
}

const PREVIEW_FMT = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatPreviewExpiry(iso: string | null): string {
  if (iso === null) return "Never";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  return PREVIEW_FMT.format(new Date(ts));
}

/** Settings → Resources sub-section per wireframe §3 — Previews table
 *  (Name · URL · Port · Access · Expires at) with empty state, Volumes
 *  attached (cross-references Overview Storage band), Policies (Attach
 *  policies CTA + Policy list with provenance arrows), Labels (key/value
 *  pills; "—" empty). */
export default function SandboxSettingsResources({
  settings,
}: SandboxSettingsResourcesProps) {
  return (
    <BandFrame label="Resources" className="border-t-0 pt-0">
      <div className="flex flex-col gap-8">
        <PreviewsSubsection previews={settings.previews} />
        <VolumesSubsection volumes={settings.volumesAttached} />
        <PoliciesSubsection policies={settings.policies} />
        <LabelsSubsection labels={settings.labels} />
      </div>
    </BandFrame>
  );
}

function ResourceSubsection({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="typography-meta text-meta-foreground">{label}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function PreviewsSubsection({
  previews,
}: {
  previews: SandboxSettings["previews"];
}) {
  return (
    <ResourceSubsection label="Previews">
      {previews.length === 0 ? (
        <p className="typography-body text-meta-foreground">
          No previews exposed for this sandbox.
        </p>
      ) : (
        <Table totalCount={previews.length} pageOffset={0} bordered>
          <TableHeader>
            <TableRow>
              <TableHeaderCell label="Name" />
              <TableHeaderCell label="URL" />
              <TableHeaderCell label="Port" />
              <TableHeaderCell label="Access" />
              <TableHeaderCell label="Expires at" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {previews.map((preview) => (
              <TableRow key={preview.name}>
                <TableCell>
                  <span className="font-mono text-foreground">
                    {preview.name}
                  </span>
                </TableCell>
                <TableCell>
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-foreground transition-colors hover:text-primary"
                  >
                    {preview.url}
                  </a>
                </TableCell>
                <TableCell variant="numeric">{preview.port}</TableCell>
                <TableCell>
                  <span className="typography-body text-foreground">
                    {preview.access}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    title={preview.expiresAt ?? undefined}
                    className="font-mono typography-body text-muted-foreground"
                  >
                    {formatPreviewExpiry(preview.expiresAt)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ResourceSubsection>
  );
}

function VolumesSubsection({
  volumes,
}: {
  volumes: SandboxSettings["volumesAttached"];
}) {
  return (
    <ResourceSubsection label="Volumes attached">
      {volumes.length === 0 ? (
        <p className="typography-body text-meta-foreground">
          No Volumes attached.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {volumes.map((volume) => (
            <li
              key={volume.name}
              className="flex flex-wrap items-center gap-3 typography-body"
            >
              <Link
                href={volume.href}
                className="font-mono text-foreground transition-colors hover:text-primary"
              >
                {volume.name}
              </Link>
              <span aria-hidden="true" className="text-meta-foreground">
                ·
              </span>
              <span className="font-mono text-muted-foreground">
                {volume.region}
              </span>
              <ProvenanceArrow label="Volume" href={volume.href} />
            </li>
          ))}
        </ul>
      )}
    </ResourceSubsection>
  );
}

function PoliciesSubsection({
  policies,
}: {
  policies: SandboxSettings["policies"];
}) {
  return (
    <ResourceSubsection
      label="Policies"
      action={
        <Button
          type="button"
          variant="ghost"
          onClick={() => toast.success("Attach policies (mock).")}
        >
          Attach policies
        </Button>
      }
    >
      {policies.length === 0 ? (
        <p className="typography-body text-meta-foreground">
          No Policies attached — workspace default applies.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {policies.map((policy) => (
            <li
              key={policy.name}
              className="flex flex-col gap-1 rounded-md border border-border px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-3 typography-body">
                <Link
                  href={policy.href}
                  className="font-mono font-medium text-foreground transition-colors hover:text-primary"
                >
                  {policy.name}
                </Link>
                <ProvenanceArrow label="Policy" href={policy.href} />
              </div>
              <p className="typography-meta text-meta-foreground">
                {policy.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ResourceSubsection>
  );
}

function LabelsSubsection({
  labels,
}: {
  labels: SandboxSettings["labels"];
}) {
  return (
    <ResourceSubsection label="Labels">
      {labels.length === 0 ? (
        <p className="typography-body text-meta-foreground">—</p>
      ) : (
        <ul className="flex flex-wrap items-center gap-2">
          {labels.map((label) => (
            <li key={label.key}>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted-surface px-2 py-0.5 font-mono typography-meta text-foreground">
                <span className="text-meta-foreground">{label.key}</span>
                <span aria-hidden="true" className="text-meta-foreground">
                  =
                </span>
                <span>{label.value}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </ResourceSubsection>
  );
}

function ProvenanceArrow({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 typography-meta text-meta-foreground transition-colors hover:text-foreground"
    >
      <ArrowUp aria-hidden="true" className="size-3.5" />
      {label}
    </Link>
  );
}
