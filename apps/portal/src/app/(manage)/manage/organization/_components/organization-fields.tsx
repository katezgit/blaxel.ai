"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CopyButton } from "@repo/ui/components/copy-button";
import { Input } from "@repo/ui/components/input";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { orgQueries } from "@/lib/query/org";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";

/**
 * Read-only Organization details — used by the user-tier view.
 * Admin view inlines its own controlled fields to own dirty-state locally.
 */
export function OrganizationFields() {
  const { accountId } = useCurrentTenancy();
  const { data: currentOrg } = useSuspenseQuery(orgQueries.account(accountId));
  const { data: orgAddress } = useSuspenseQuery(orgQueries.address(accountId));
  return (
    <div className="flex flex-col gap-4">
      <FieldRow>
        <Field label="Organization name">
          <Input defaultValue={currentOrg.name} disabled />
        </Field>
        <Field label="Members">
          <Input defaultValue={String(currentOrg.members)} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={1}>
        <Field label="Primary business address">
          <Input defaultValue={orgAddress.line1} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={1}>
        <Field label="Address line 2">
          <Input defaultValue={orgAddress.line2} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={2}>
        <Field label="Country">
          <Input defaultValue={orgAddress.country} disabled />
        </Field>
        <Field label="State / province">
          <Input defaultValue={orgAddress.state} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={2}>
        <Field label="City">
          <Input defaultValue={orgAddress.city} disabled />
        </Field>
        <Field label="Postal code">
          <Input defaultValue={orgAddress.postalCode} disabled />
        </Field>
      </FieldRow>

      <div className="flex items-center gap-2 font-mono typography-caption text-meta-foreground">
        <span>Organization ID: {currentOrg.id}</span>
        <CopyButton value={currentOrg.id} ariaLabel="Copy organization ID" />
      </div>
    </div>
  );
}
