"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { DEFAULT_WORKSPACE_SLUG } from "@/lib/mock/org";

const GET_STARTED_HREF = `/${DEFAULT_WORKSPACE_SLUG}/get-started`;

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
] as const;

const INVITE_SCHEMA = z.object({
  emails: z.string().trim().min(1, "Add at least one email address."),
  role: z.enum(["admin", "member"]),
});

type InviteFormValues = z.infer<typeof INVITE_SCHEMA>;

export default function InviteMembersForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(INVITE_SCHEMA),
    mode: "onChange",
    defaultValues: {
      emails: "",
      // Default to Admin — invited teammates are co-admins on Blaxel by intent.
      role: "admin",
    },
  });

  const emailsValue = watch("emails");

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    router.push(GET_STARTED_HREF);
  });

  const submitDisabled = isSubmitting || !emailsValue?.trim();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FormField id="invite-emails" label="Email addresses" required>
          <Input
            {...register("emails")}
            type="text"
            autoComplete="off"
            autoFocus
            placeholder="teammate@company.com"
          />
        </FormField>
        <span className="font-mono typography-meta text-muted-foreground">
          Separate emails with commas or Enter.
        </span>
      </div>

      <FormField id="invite-role" label="Role">
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="mt-2 flex flex-col items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={submitDisabled}
          aria-busy={isSubmitting}
        >
          Send invitations
        </Button>
        <Link
          href={GET_STARTED_HREF}
          className="typography-caption text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip
        </Link>
      </div>
    </form>
  );
}
