// Region display helper — maps a region slug to a flag + human-readable city
// label so the table reads at a glance (e.g. "🇺🇸 Portland (us-pdx-1)") instead
// of forcing operators to memorize datacenter slugs. Unknown slugs render
// neutrally with a globe glyph and the raw slug as the label.

interface RegionDescriptor {
  flag: string;
  label: string;
}

const REGIONS: Record<string, RegionDescriptor> = {
  "us-pdx-1": { flag: "🇺🇸", label: "Portland" },
  "us-was-1": { flag: "🇺🇸", label: "Washington DC" },
  "eu-lon-1": { flag: "🇬🇧", label: "London" },
};

export interface FormattedRegion extends RegionDescriptor {
  slug: string;
}

export function formatRegion(slug: string): FormattedRegion {
  const region = REGIONS[slug];
  if (region) return { ...region, slug };
  return { flag: "🌐", label: slug, slug };
}

// All region slugs that can be picked at registration. Order matters — the
// list renders top-to-bottom in the Add-domain dialog's region select.
export const REGION_SLUGS: ReadonlyArray<string> = [
  "us-pdx-1",
  "us-was-1",
  "eu-lon-1",
];
