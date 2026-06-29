"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

interface CreatePolicySkeletonProps {
  // Omitted by route-level loading.tsx (no `params` access during segment
  // transition) — the parent crumb renders as plain text in that pass.
  // CreatePolicyView passes it during the duplicate prefetch so the link
  // stays live.
  listHref?: string;
}

// Silhouette mirror of CreatePolicyView: breadcrumb + heading row,
// two-column form layout (sections on the left, code rail on the right),
// footer hairline + action row. Used during the duplicate prefetch and
// as the route-level loading fallback.
export default function CreatePolicySkeleton({
  listHref,
}: CreatePolicySkeletonProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-(--page-max-width) flex-col gap-6 overflow-hidden px-6 pb-6 pt-6 md:px-8 lg:px-12 xl:px-20">
      <header className="flex flex-col gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 typography-body text-muted-foreground"
        >
          {listHref ? (
            <Link
              href={listHref}
              className="cursor-pointer rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Policies
            </Link>
          ) : (
            <span className="text-muted-foreground">Policies</span>
          )}
          <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
          <span aria-current="page" className="truncate text-foreground">
            Create policy
          </span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-44 rounded-sm" />
            <Skeleton className="h-4 w-80 rounded-sm" />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,36rem)_minmax(0,28rem)]">
          {/* Form column — five sections mirroring the live form in order
           * AND shape so the swap from skeleton to form induces zero
           * per-section height delta:
           *   1. Choose a policy type — single FormField (label + select)
           *   2. Name the policy — two stacked FormFields (Display, Name+helper)
           *   3. Configure the rule — chip group + caption (no bordered wrap)
           *   4. Choose target workloads — chip group wrapping to 2 rows
           *   5. Labels — empty-state caption + add button row */}
          <div className="flex flex-col gap-10 pl-1 pr-4">
            <FormSectionSilhouette
              titleWidth="w-44"
              body={
                <div className="flex max-w-sm flex-col gap-1.5">
                  <Skeleton className="h-4 w-20 rounded-sm" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              }
            />
            <FormSectionSilhouette
              titleWidth="w-36"
              body={
                <div className="flex max-w-sm flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24 rounded-sm" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-12 rounded-sm" />
                    <Skeleton className="h-9 w-full rounded-md" />
                    <Skeleton className="h-8 w-64 rounded-sm" />
                  </div>
                </div>
              }
            />
            <FormSectionSilhouette
              titleWidth="w-40"
              descriptionWidth="w-72"
              body={
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-24 rounded-md" />
                    <Skeleton className="h-7 w-32 rounded-md" />
                    <Skeleton className="h-7 w-44 rounded-md" />
                  </div>
                  <Skeleton className="h-8 w-72 rounded-sm" />
                </div>
              }
            />
            <FormSectionSilhouette
              titleWidth="w-48"
              descriptionWidth="w-64"
              body={
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-20 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                  <Skeleton className="h-7 w-28 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                  <Skeleton className="h-7 w-28 rounded-md" />
                </div>
              }
            />
            <FormSectionSilhouette
              titleWidth="w-20"
              descriptionWidth="w-80"
              body={
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 rounded-sm" />
                  <Skeleton className="h-9 w-28 rounded-md" />
                </div>
              }
            />
          </div>

          {/* Code rail silhouette — header + language tabs + code block. */}
          <aside className="hidden min-h-0 flex-col gap-4 pl-1 pr-4 lg:flex">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-32 rounded-sm" />
              <Skeleton className="h-3 w-44 rounded-sm" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-20 rounded-sm" />
              <Skeleton className="h-5 w-16 rounded-sm" />
              <Skeleton className="h-5 w-10 rounded-sm" />
              <Skeleton className="h-5 w-12 rounded-sm" />
              <Skeleton className="h-5 w-10 rounded-sm" />
            </div>
            <Skeleton className="h-64 w-full rounded-md" />
          </aside>
        </div>

        {/* Footer hairline + action row — anchored to the form column. */}
        <div className="shrink-0 lg:grid lg:grid-cols-[minmax(0,36rem)_minmax(0,28rem)] lg:gap-8">
          <div className="border-t border-border pt-6">
            <div className="flex max-w-sm items-center justify-end">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormSectionSilhouetteProps {
  titleWidth: string;
  descriptionWidth?: string;
  body: React.ReactNode;
}

function FormSectionSilhouette({
  titleWidth,
  descriptionWidth,
  body,
}: FormSectionSilhouetteProps) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <Skeleton className={`h-4 rounded-sm ${titleWidth}`} />
        {descriptionWidth ? (
          <Skeleton className={`h-3 rounded-sm ${descriptionWidth}`} />
        ) : null}
      </header>
      {body}
    </section>
  );
}
