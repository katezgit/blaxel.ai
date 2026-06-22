"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAccountState } from "@/lib/mock/account-context";
import DomainCard from "./domain-card";

const schema = z.object({
  domain: z
    .string()
    .min(3, "Enter a domain like acme.com")
    .regex(
      /^[a-z0-9.-]+\.[a-z]{2,}$/i,
      "Enter a valid domain (e.g. acme.com)",
    ),
});

type Values = z.infer<typeof schema>;

const FALLBACK_PLACEHOLDER = "acme.com";

interface DomainSectionProps {
  /** User's email domain, used to suggest the most likely value in the input. */
  emailDomain: string | null;
}

export default function DomainSection({ emailDomain }: DomainSectionProps) {
  const { state, addDomain } = useAccountState();
  const placeholder = emailDomain ?? FALLBACK_PLACEHOLDER;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { domain: "" },
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const onAdd = handleSubmit(async ({ domain }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const normalized = domain.toLowerCase().trim();
    addDomain(normalized);
    reset({ domain: "" });
    toast.success(`Domain ${normalized} added — pending verification`);
  });

  const errorId = "domain-input-error";
  const hasDomains = state.domains.length > 0;

  return (
    <section aria-labelledby="domain-section-heading" className="mb-8 flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2
          id="domain-section-heading"
          className="typography-subtitle font-semibold text-foreground"
        >
          Domain authentication policy
        </h2>
        <p className="typography-body text-muted-foreground">
          Enforce specific login methods for your email domains without setting
          up a SAML provider. Verify domain ownership via a DNS TXT record,
          then choose which authentication methods (Google, GitHub, email) are
          allowed for users with that domain.
        </p>
      </header>

      <form onSubmit={onAdd} noValidate className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <Input
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Add a domain"
            aria-invalid={errors.domain ? true : undefined}
            aria-describedby={errors.domain ? errorId : undefined}
            {...register("domain")}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !isValid}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add domain
          </Button>
        </div>
        {errors.domain ? (
          <span
            id={errorId}
            role="alert"
            className="typography-caption font-medium text-state-errored-text"
          >
            {errors.domain.message}
          </span>
        ) : null}
      </form>

      {hasDomains ? (
        <div className="flex flex-col gap-3">
          {state.domains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      ) : (
        <p className="typography-body text-muted-foreground">
          No domains configured yet. Add a domain to enforce authentication
          policies for your users.
        </p>
      )}
    </section>
  );
}
