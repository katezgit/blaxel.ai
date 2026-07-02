"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import {
  FormField,
  FieldHelper,
} from "@repo/ui/components/form-field";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Combobox,
  type ComboboxOption,
} from "@repo/ui/components/combobox";
import type { Volume } from "@/lib/mock/volumes";
import type { SandboxRegion } from "@/lib/mock/sandboxes";
import type { AttachedVolume } from "./form-state";

interface VolumesFieldProps {
  workspaceVolumes: ReadonlyArray<Volume>;
  attached: ReadonlyArray<AttachedVolume>;
  onChange: (next: ReadonlyArray<AttachedVolume>) => void;
  /** Region the form is targeting — used to warn when an attached Volume
   * lives elsewhere. */
  targetRegion: SandboxRegion;
}

const REGION_OPTIONS: ReadonlyArray<{
  value: AttachedVolume["region"];
  label: string;
}> = [
  { value: "auto", label: "auto" },
  { value: "eu-fra-1", label: "eu-fra-1" },
  { value: "eu-lon-1", label: "eu-lon-1" },
  { value: "us-was-1", label: "us-was-1" },
  { value: "us-pdx-1", label: "us-pdx-1" },
];

export function VolumesField({
  workspaceVolumes,
  attached,
  onChange,
  targetRegion,
}: VolumesFieldProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const hasWorkspaceVolumes = workspaceVolumes.length > 0;

  function attachVolume(volume: Volume) {
    if (attached.some((v) => v.id === volume.id)) return;
    onChange([
      ...attached,
      { id: volume.id, name: volume.name, region: volume.region },
    ]);
  }

  function removeVolume(volumeId: string) {
    onChange(attached.filter((v) => v.id !== volumeId));
  }

  function handleCreated(volume: AttachedVolume) {
    onChange([...attached, volume]);
    setCreateOpen(false);
  }

  if (!hasWorkspaceVolumes && attached.length === 0) {
    return (
      <>
        <div className="rounded-md border border-dashed border-border bg-card p-4">
          <p className="typography-body text-foreground">
            No Volumes in this workspace.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => setCreateOpen(true)}
          >
            <Plus aria-hidden="true" />
            Create Volume
          </Button>
        </div>
        <CreateVolumeDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleCreated}
          defaultRegion={targetRegion}
        />
      </>
    );
  }

  const options: ReadonlyArray<ComboboxOption> = workspaceVolumes
    .filter((v) => !attached.some((a) => a.id === v.id))
    .map((v) => ({
      value: v.id,
      label: `${v.name} (${v.region})`,
    }));

  return (
    <div className="flex flex-col gap-3">
      {attached.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {attached.map((volume) => (
            <li
              key={volume.id}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
            >
              <span className="typography-body text-foreground">
                {volume.name}
              </span>
              <span className="typography-meta font-mono text-meta-foreground">
                {volume.region}
              </span>
              {volume.region !== targetRegion && targetRegion !== "auto" ? (
                <span className="typography-caption text-state-warning-text">
                  · region mismatch
                </span>
              ) : null}
              <IconButton
                variant="ghost"
                className="ml-auto"
                aria-label={`Detach ${volume.name}`}
                onClick={() => removeVolume(volume.id)}
              >
                <X aria-hidden="true" />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : null}

      {options.length > 0 ? (
        <Combobox
          value={null}
          onValueChange={(value) => {
            if (!value) return;
            const found = workspaceVolumes.find((v) => v.id === value);
            if (found) attachVolume(found);
          }}
          options={[...options]}
          placeholder="Search or select a Volume"
          emptyText="No Volumes match."
        />
      ) : (
        <p className="typography-caption text-muted-foreground">
          All Volumes are attached.
        </p>
      )}

      <Button
        type="button"
        variant="ghost"
        className="self-start"
        onClick={() => setCreateOpen(true)}
      >
        <Plus aria-hidden="true" />
        Create a new Volume
      </Button>

      <CreateVolumeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
        defaultRegion={targetRegion}
      />
    </div>
  );
}

interface CreateVolumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (volume: AttachedVolume) => void;
  defaultRegion: SandboxRegion;
}

function CreateVolumeDialog({
  open,
  onOpenChange,
  onCreated,
  defaultRegion,
}: CreateVolumeDialogProps) {
  const initialRegion: AttachedVolume["region"] =
    defaultRegion === "auto" ? "eu-fra-1" : defaultRegion;
  const [name, setName] = useState("");
  const [region, setRegion] = useState<AttachedVolume["region"]>(initialRegion);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setRegion(initialRegion);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleCreate() {
    if (!name.trim()) {
      setError("Volume name is required.");
      return;
    }
    const id = `vol_${name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")}`;
    onCreated({ id, name: name.trim(), region });
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Create Volume</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <FormField
              id="volume-name"
              label="Name"
              required
              error={error ?? undefined}
            >
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="vol-eval-store"
              />
            </FormField>
            <FormField id="volume-region" label="Region" required>
              <Select
                value={region}
                onValueChange={(value) =>
                  setRegion(value as AttachedVolume["region"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FieldHelper>
              The new Volume is attached to this Sandbox on create.
            </FieldHelper>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleCreate}>
            Create Volume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
