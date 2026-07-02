"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { SearchInput } from "@repo/ui/components/search-input";
import { Chip, ChipGroup } from "@repo/ui/components/chip";
import type {
  SandboxImage,
  SandboxImageCategory,
} from "@/lib/mock/sandbox-images";

const CATEGORY_FILTERS: ReadonlyArray<{
  value: SandboxImageCategory | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "runtime", label: "Runtimes" },
  { value: "database", label: "Databases" },
  { value: "tool", label: "Tools" },
  { value: "custom", label: "Custom" },
];

interface StepImageProps {
  images: ReadonlyArray<SandboxImage>;
  selectedRef: string | null;
  onSelect: (ref: string) => void;
  sdkHref: string;
}

export function StepImage({
  images,
  selectedRef,
  onSelect,
  sdkHref,
}: StepImageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SandboxImageCategory | "all">("all");

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return images.filter((image) => {
      if (category !== "all" && image.category !== category) return false;
      if (normalized) {
        const haystack =
          `${image.name} ${image.ref} ${image.description}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [images, search, category]);

  const platform = filtered.filter((image) => image.category !== "custom");
  const custom = filtered.filter((image) => image.category === "custom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-sm">
          <SearchInput
            defaultValue={search}
            onLiveChange={setSearch}
            placeholder="Search Images…"
            aria-label="Search Images"
          />
        </div>
        <ChipGroup
          value={category === "all" ? [] : [category]}
          onChange={(next) => setCategory((next[0] as SandboxImageCategory) ?? "all")}
          aria-label="Image category"
        >
          {CATEGORY_FILTERS.filter((c) => c.value !== "all").map((c) => (
            <Chip key={c.value} value={c.value}>
              {c.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="flex items-center justify-end">
        <Link
          href={sdkHref}
          className="inline-flex items-center gap-1 typography-caption text-meta-foreground hover:text-foreground"
        >
          Use SDK / CLI instead
          <ArrowRight aria-hidden="true" className="size-3" />
        </Link>
      </div>

      <ImageGrid
        heading="Platform Images"
        images={platform}
        selectedRef={selectedRef}
        onSelect={onSelect}
      />

      <ImageGrid
        heading="Custom Images"
        images={custom}
        selectedRef={selectedRef}
        onSelect={onSelect}
        emptyMessage="No custom Images in this workspace."
      />
    </div>
  );
}

interface ImageGridProps {
  heading: string;
  images: ReadonlyArray<SandboxImage>;
  selectedRef: string | null;
  onSelect: (ref: string) => void;
  emptyMessage?: string;
}

function ImageGrid({
  heading,
  images,
  selectedRef,
  onSelect,
  emptyMessage,
}: ImageGridProps) {
  return (
    <section aria-labelledby={`image-grid-${heading}`} className="flex flex-col gap-3">
      <h2
        id={`image-grid-${heading}`}
        className="typography-body font-semibold text-foreground"
      >
        {heading}
      </h2>
      {images.length === 0 ? (
        <p className="typography-caption text-muted-foreground">
          {emptyMessage ?? "No Images match your filter."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <ImageTile
              key={image.id}
              image={image}
              selected={image.ref === selectedRef}
              onSelect={() => onSelect(image.ref)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface ImageTileProps {
  image: SandboxImage;
  selected: boolean;
  onSelect: () => void;
}

function ImageTile({ image, selected, onSelect }: ImageTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col gap-2 rounded-md border bg-card p-4 text-left",
        "transition-colors duration-fast ease-out-standard",
        "hover:border-border-strong",
        selected
          ? "border-primary-border bg-primary-soft"
          : "border-border",
      )}
    >
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="size-3.5" />
        </span>
      ) : null}
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "typography-body font-medium",
            selected ? "text-foreground" : "text-foreground",
          )}
        >
          {image.name}
        </span>
        <span className="typography-meta font-mono text-meta-foreground">
          {image.ref}
        </span>
      </div>
      <p className="typography-caption text-muted-foreground">
        {image.description}
      </p>
      <p className="mt-auto typography-caption text-meta-foreground">
        {image.publisher} · v{image.version}
      </p>
    </button>
  );
}
