import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import type { SandboxAuditUser, SandboxSettings } from "@/lib/mock/sandbox-settings-fixtures";
import BandFrame from "./band-frame";

interface SandboxSettingsAuditProps {
  audit: SandboxSettings["audit"];
}

const UTC_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatUtc(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  return UTC_FMT.format(new Date(ts));
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Settings → Audit sub-section per wireframe §3 — Created by / Updated by
 *  rows with avatar + name + absolute UTC timestamp, plus a separate
 *  Created at / Updated at row for the absolute timestamps. The repetition
 *  is intentional: the avatar rows answer "who," the timestamp rows answer
 *  "when," and Alex scans them independently during incident triage. */
export default function SandboxSettingsAudit({
  audit,
}: SandboxSettingsAuditProps) {
  return (
    <BandFrame label="Audit" className="border-t-0 pt-0">
      <dl className="flex flex-col gap-4">
        <UserRow label="Created by" user={audit.createdBy} occurredAt={audit.createdAt} />
        <UserRow label="Updated by" user={audit.updatedBy} occurredAt={audit.updatedAt} />
      </dl>
    </BandFrame>
  );
}

interface UserRowProps {
  label: string;
  user: SandboxAuditUser;
  occurredAt: string;
}

function UserRow({ label, user, occurredAt }: UserRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="typography-meta text-meta-foreground">{label}</dt>
      <dd className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarImage src={user.avatarUrl} alt="" />
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
        <span className="flex flex-col items-end gap-0.5">
          <span className="typography-body text-foreground">
            {user.displayName}
          </span>
          <span
            title={occurredAt}
            className="font-mono typography-meta text-meta-foreground"
          >
            {formatUtc(occurredAt)}
          </span>
        </span>
      </dd>
    </div>
  );
}
