import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type {
  Sandbox,
  SandboxAttachedDrive,
  SandboxAttachedVolume,
  SandboxRegion,
} from "@/lib/mock/sandboxes";
import BandFrame from "./band-frame";

interface SandboxStorageBandProps {
  sandbox: Sandbox;
}

/** §1.8 Storage band — Volumes (1:1) + Agent Drives (N:N). The two
 *  primitives stay visually separate per `platform.md` disambiguation
 *  rule. Default rows carry no chrome — section sub-heading + spacing +
 *  typography do the grouping work (per `anti-patterns/decoration.md §2`).
 *  Only the region-mismatch warning row earns its border + tint because
 *  the visual weight is signal, not chrome. */
export default function SandboxStorageBand({ sandbox }: SandboxStorageBandProps) {
  return (
    <BandFrame label="Storage">
      <div className="flex flex-col gap-6">
        <StorageSubsection label="Volumes">
          {sandbox.attachedVolumes.length === 0 ? (
            <EmptyRow message="No Volumes attached." />
          ) : (
            <ul className="flex flex-col gap-1">
              {sandbox.attachedVolumes.map((volume) => (
                <VolumeRow
                  key={volume.name}
                  volume={volume}
                  sandboxRegion={sandbox.spec.region}
                />
              ))}
            </ul>
          )}
        </StorageSubsection>

        <StorageSubsection label="Agent Drives">
          {sandbox.attachedDrives.length === 0 ? (
            <EmptyRow message="No Agent Drives attached." />
          ) : (
            <ul className="flex flex-col gap-1">
              {sandbox.attachedDrives.map((drive) => (
                <DriveRow key={drive.name} drive={drive} />
              ))}
            </ul>
          )}
        </StorageSubsection>
      </div>
    </BandFrame>
  );
}

interface StorageSubsectionProps {
  label: string;
  children: React.ReactNode;
}

function StorageSubsection({ label, children }: StorageSubsectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="typography-meta text-meta-foreground">{label}</h3>
      {children}
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <p className="typography-body text-meta-foreground">{message}</p>
  );
}

interface VolumeRowProps {
  volume: SandboxAttachedVolume;
  sandboxRegion: SandboxRegion;
}

function VolumeRow({ volume, sandboxRegion }: VolumeRowProps) {
  const mismatched = volume.region !== sandboxRegion;
  return (
    <li
      className={cn(
        "flex flex-col gap-1 py-1",
        mismatched &&
          "rounded-md border border-state-errored-subtle bg-state-errored-subtle px-4 py-3",
      )}
    >
      <div className="flex flex-wrap items-center gap-3 typography-body">
        <Link
          href={volume.href}
          className="font-mono text-foreground transition-colors hover:text-primary"
        >
          {volume.name}
        </Link>
        <DotSeparator />
        <span className="font-mono text-muted-foreground">{volume.region}</span>
        <DotSeparator />
        <span className="font-mono text-muted-foreground">{volume.mountPath}</span>
        <DotSeparator />
        <span className="font-mono text-muted-foreground">
          {volume.sizeGiB.toFixed(1)} GiB
        </span>
        <DotSeparator />
        <ProvenanceArrow label="Volume" href={volume.href} />
      </div>
      {mismatched && (
        <p className="typography-meta text-state-errored-text">
          Region mismatch — Volumes must be in the same region as the Sandbox.
        </p>
      )}
    </li>
  );
}

function DriveRow({ drive }: { drive: SandboxAttachedDrive }) {
  return (
    <li className="flex flex-wrap items-center gap-3 py-1 typography-body">
      <Link
        href={drive.href}
        className="font-mono text-foreground transition-colors hover:text-primary"
      >
        {drive.name}
      </Link>
      <DotSeparator />
      <span className="font-mono text-muted-foreground">{drive.region}</span>
      <DotSeparator />
      <span className="font-mono text-muted-foreground">{drive.mountPath}</span>
      <DotSeparator />
      <span className="font-mono text-muted-foreground">{drive.mode}</span>
      <DotSeparator />
      <ProvenanceArrow label="Drive" href={drive.href} />
    </li>
  );
}

function DotSeparator() {
  return (
    <span aria-hidden="true" className="text-meta-foreground">
      ·
    </span>
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
