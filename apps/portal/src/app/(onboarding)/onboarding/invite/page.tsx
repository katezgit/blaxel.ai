import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import ProgressStrip from "../../_components/progress-strip";
import InviteMembersForm from "./invite-members-form";

export const metadata: Metadata = {
  title: "Invite members",
};

export default function InviteMembersPage() {
  return (
    <Card variant="elevated" className="w-full max-w-[420px]">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between">
          <ProgressStrip currentStep={2} />
          <Link
            href="/onboarding"
            className="typography-caption text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">{"← "}</span>
            Back
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="typography-subtitle font-semibold text-foreground">
            Invite members
          </h1>
          <p className="typography-caption text-muted-foreground">
            Optional — add teammates now or skip this step.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <InviteMembersForm />
      </CardContent>
    </Card>
  );
}
