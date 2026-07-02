import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSkeletonRow,
} from "@repo/ui/components/table";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <IdentitySkeleton />
      <AuditSkeleton />
      <DeploymentConfigSkeleton />
      <LifecycleSkeleton />
      <ResourcesSkeleton />
    </div>
  );
}

function IdentitySkeleton() {
  return (
    <section aria-label="Identity" className="flex flex-col gap-6 pt-2">
      <IdentityRow valueWidth="w-24" />
      <IdentityRow valueWidth="w-full max-w-[36rem]" />
    </section>
  );
}

function IdentityRow({ valueWidth }: { valueWidth: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="typography-meta text-meta-foreground">
        <Skeleton className="inline-block h-2.5 w-20 rounded-sm align-middle" />
      </h3>
      <div className="flex items-start justify-between gap-3">
        <p className="typography-body text-foreground">
          <Skeleton
            className={`inline-block h-3.5 rounded-sm align-middle ${valueWidth}`}
          />
        </p>
        <Skeleton className="size-6 shrink-0 rounded-sm" />
      </div>
    </div>
  );
}

function BandHeader({ width }: { width: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="typography-subtitle text-foreground">
        <Skeleton
          className={`inline-block h-4 rounded-sm align-middle ${width}`}
        />
      </h2>
    </div>
  );
}

function AuditSkeleton() {
  return (
    <section
      aria-label="Audit"
      className="group flex flex-col gap-4 border-border border-t-0 pt-0"
    >
      <BandHeader width="w-16" />
      <dl className="flex flex-col gap-4">
        <AuditRow />
        <AuditRow />
      </dl>
    </section>
  );
}

function AuditRow() {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="typography-meta text-meta-foreground">
        <Skeleton className="inline-block h-2.5 w-20 rounded-sm align-middle" />
      </dt>
      <dd className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-full" />
        <span className="flex flex-col items-end gap-0.5">
          <span className="typography-body text-foreground">
            <Skeleton className="inline-block h-3.5 w-24 rounded-sm align-middle" />
          </span>
          <span className="font-mono typography-meta text-meta-foreground">
            <Skeleton className="inline-block h-2.5 w-40 rounded-sm align-middle" />
          </span>
        </span>
      </dd>
    </div>
  );
}

function DeploymentConfigSkeleton() {
  return (
    <section
      aria-label="Deployment config"
      className="group flex flex-col gap-4 border-border border-t-0 pt-0"
    >
      <BandHeader width="w-40" />
      <dl className="flex flex-col gap-4">
        <ConfigRow valueWidth="w-56" />
        <ConfigRow valueWidth="w-20" />
        <ConfigRow valueWidth="w-48" />
        <ConfigRow valueWidth="w-24" />
        <ConfigRow valueWidth="w-64" />
      </dl>
    </section>
  );
}

function ConfigRow({ valueWidth }: { valueWidth: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <dt className="typography-meta text-meta-foreground">
        <Skeleton className="inline-block h-2.5 w-20 rounded-sm align-middle" />
      </dt>
      <dd className="min-w-0">
        <span className="typography-body text-foreground">
          <Skeleton
            className={`inline-block h-3.5 rounded-sm align-middle ${valueWidth}`}
          />
        </span>
      </dd>
    </div>
  );
}

function LifecycleSkeleton() {
  return (
    <section
      aria-label="Lifecycle"
      className="group flex flex-col gap-4 border-border border-t-0 pt-0"
    >
      <BandHeader width="w-20" />
      <div className="flex flex-col gap-6">
        <LifecycleSubsection>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </LifecycleSubsection>
        <LifecycleSubsection>
          <ul className="flex flex-col gap-2">
            <LifecyclePolicyRow />
            <LifecyclePolicyRow />
          </ul>
        </LifecycleSubsection>
        <LifecycleSubsection>
          <span className="font-mono typography-body text-foreground">
            <Skeleton className="inline-block h-3.5 w-40 rounded-sm align-middle" />
          </span>
        </LifecycleSubsection>
      </div>
    </section>
  );
}

function LifecycleSubsection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="typography-meta text-meta-foreground">
        <Skeleton className="inline-block h-2.5 w-24 rounded-sm align-middle" />
      </h3>
      {children}
    </div>
  );
}

function LifecyclePolicyRow() {
  return (
    <li className="flex flex-col gap-0.5">
      <span className="typography-body text-foreground">
        <Skeleton className="inline-block h-3.5 w-32 rounded-sm align-middle" />
      </span>
      <span className="typography-meta text-meta-foreground">
        <Skeleton className="inline-block h-2.5 w-48 rounded-sm align-middle" />
      </span>
    </li>
  );
}

function ResourcesSkeleton() {
  return (
    <section
      aria-label="Resources"
      className="group flex flex-col gap-4 border-border border-t-0 pt-0"
    >
      <BandHeader width="w-24" />
      <div className="flex flex-col gap-8">
        <ResourceSubsection labelWidth="w-16">
          <Table totalCount={2} pageOffset={0} bordered>
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
              <TableSkeletonRow colCount={5} />
              <TableSkeletonRow colCount={5} />
            </TableBody>
          </Table>
        </ResourceSubsection>
        <ResourceSubsection labelWidth="w-32">
          <ul className="flex flex-col gap-1.5">
            <VolumeRow />
            <VolumeRow />
          </ul>
        </ResourceSubsection>
        <ResourceSubsection labelWidth="w-16" actionWidth="w-32">
          <ul className="flex flex-col gap-2">
            <PolicyRow />
          </ul>
        </ResourceSubsection>
        <ResourceSubsection labelWidth="w-12">
          <ul className="flex flex-wrap items-center gap-2">
            <LabelPill />
            <LabelPill />
            <LabelPill />
          </ul>
        </ResourceSubsection>
      </div>
    </section>
  );
}

function ResourceSubsection({
  labelWidth,
  actionWidth,
  children,
}: {
  labelWidth: string;
  actionWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="typography-meta text-meta-foreground">
          <Skeleton
            className={`inline-block h-2.5 rounded-sm align-middle ${labelWidth}`}
          />
        </h3>
        {actionWidth ? (
          <Skeleton className={`h-8 rounded-md ${actionWidth}`} />
        ) : null}
      </div>
      {children}
    </div>
  );
}

function VolumeRow() {
  return (
    <li className="flex flex-wrap items-center gap-3 typography-body">
      <Skeleton className="inline-block h-3.5 w-40 rounded-sm align-middle" />
      <Skeleton className="inline-block h-3.5 w-16 rounded-sm align-middle" />
      <Skeleton className="inline-block h-3 w-16 rounded-sm align-middle" />
    </li>
  );
}

function PolicyRow() {
  return (
    <li className="flex flex-col gap-1 rounded-md border border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 typography-body">
        <Skeleton className="inline-block h-3.5 w-32 rounded-sm align-middle" />
        <Skeleton className="inline-block h-3 w-14 rounded-sm align-middle" />
      </div>
      <p className="typography-meta text-meta-foreground">
        <Skeleton className="inline-block h-2.5 w-72 rounded-sm align-middle" />
      </p>
    </li>
  );
}

function LabelPill() {
  return (
    <li>
      <Skeleton className="h-5 w-28 rounded-sm" />
    </li>
  );
}
