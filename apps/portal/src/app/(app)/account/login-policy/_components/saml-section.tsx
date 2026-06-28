"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import InlineGate from "@/app/(app)/account/_components/inline-gate";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { useAccountState } from "@/lib/mock/account-context";

const SP_SSO_URL = "https://app.blaxel.ai/sso/saml/callback";
const SP_ENTITY_ID = "https://app.blaxel.ai/sso/saml/metadata";

const schema = z.object({
  idpSsoUrl: z
    .string()
    .url("Enter a valid URL")
    .min(1, "IdP SSO URL is required"),
  certificate: z
    .string()
    .min(20, "Paste the X.509 certificate from your IdP"),
});

type Values = z.infer<typeof schema>;

export default function SamlSection() {
  const { state, saveSaml } = useAccountState();
  const [expanded, setExpanded] = useState(false);
  const isTierZero = state.tier === 0;
  const isConfigured = state.saml.idpSsoUrl !== null;
  const panelId = "saml-section-panel";

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { idpSsoUrl: "", certificate: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const onSave = handleSubmit(async ({ idpSsoUrl }) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    saveSaml({
      idpSsoUrl,
      certificateExpiresOn: "2027-01-01",
    });
    reset({ idpSsoUrl: "", certificate: "" });
    toast.success("SAML configured");
  });

  return (
    <section aria-labelledby="saml-section-heading" className="border-t border-border pt-4">
      <h2 id="saml-section-heading" className="m-0">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="-mx-2 flex w-full items-center justify-between gap-3 rounded-md px-2 py-1 text-left transition-colors duration-fast ease-out-standard hover:bg-hover-surface focus-visible:shadow-focus-ring"
        >
          <span className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            <span className="typography-body font-medium text-foreground">
              Enterprise SSO (SAML)
            </span>
            <span className="typography-caption text-muted-foreground">
              Connect a SAML identity provider.
            </span>
          </span>
          <span className="flex items-center gap-2">
            {isTierZero ? <Badge variant="neutral">Tier 1+</Badge> : null}
            {isConfigured ? (
              <Badge variant="success" showDot>
                Active
              </Badge>
            ) : null}
          </span>
        </button>
      </h2>

      <div id={panelId} hidden={!expanded}>
        {isTierZero ? (
          <div className="mt-4 pl-6">
            <InlineGate tier={1} verb="configure enterprise SSO" />
          </div>
        ) : null}

        {!isTierZero && !isConfigured ? (
          <form onSubmit={onSave} noValidate className="mt-6 flex flex-col gap-4 pl-6">
            <section className="flex flex-col gap-3">
              <h3 className="typography-body font-semibold text-foreground">
                Service Provider details
              </h3>
              <div className="flex flex-col gap-2">
                <span className="typography-caption text-muted-foreground">SSO URL</span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
                  <span className="flex-1 truncate font-mono typography-caption text-foreground">
                    {SP_SSO_URL}
                  </span>
                  <CopyButton value={SP_SSO_URL} tooltipLabel="Copy SSO URL" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="typography-caption text-muted-foreground">
                  Entity ID (Audience URI)
                </span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
                  <span className="flex-1 truncate font-mono typography-caption text-foreground">
                    {SP_ENTITY_ID}
                  </span>
                  <CopyButton value={SP_ENTITY_ID} tooltipLabel="Copy Entity ID" />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="typography-body font-semibold text-foreground">
                Identity Provider details
              </h3>
              <FieldRow cols={1}>
                <Field
                  label="IdP SSO URL"
                  error={errors.idpSsoUrl?.message}
                >
                  <Input
                    placeholder="https://your-idp.com/sso/saml"
                    aria-invalid={errors.idpSsoUrl ? true : undefined}
                    {...register("idpSsoUrl")}
                  />
                </Field>
              </FieldRow>
              <FieldRow cols={1}>
                <Field
                  label="IdP Certificate (X.509)"
                  error={errors.certificate?.message}
                >
                  <Textarea
                    className="min-h-32 font-mono typography-caption"
                    placeholder="Paste certificate here..."
                    aria-invalid={errors.certificate ? true : undefined}
                    {...register("certificate")}
                  />
                </Field>
              </FieldRow>
            </section>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? "Saving…" : "Save SAML configuration"}
              </Button>
            </div>
          </form>
        ) : null}

        {!isTierZero && isConfigured ? (
          <div className="mt-6 flex flex-col gap-3 pl-6">
            <p className="typography-body text-foreground">
              SAML is configured for this account.
            </p>
            <dl className="flex flex-col gap-2 typography-body">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="typography-caption text-muted-foreground">
                  IdP SSO URL
                </dt>
                <dd className="font-mono typography-caption text-foreground">
                  {state.saml.idpSsoUrl}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="typography-caption text-muted-foreground">
                  Certificate expires
                </dt>
                <dd className="font-mono typography-caption text-foreground">
                  {state.saml.certificateExpiresOn}
                </dd>
              </div>
            </dl>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => saveSaml({ idpSsoUrl: null, certificateExpiresOn: null })}>
                Remove SAML configuration
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
