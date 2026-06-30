import {
  ArrowDownToLine,
  Check,
  Mail,
  Monitor,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import type {
  MemberSource,
  MemberStatus,
  Role,
} from "@/lib/mock/types";

export const ROLE_META: Record<
  Role,
  { label: string; icon: LucideIcon; description?: string }
> = {
  owner: { label: "Owner", icon: Shield },
  admin: {
    label: "Admin",
    icon: Shield,
    description:
      "Can edit resources, change workspace settings, and invite users.",
  },
  member: {
    label: "Member",
    icon: User,
    description:
      "Can edit resources, and view workspace settings and users.",
  },
};

export const SOURCE_META: Record<
  MemberSource,
  { label: string; icon: LucideIcon }
> = {
  "directory-sync": { label: "Directory sync", icon: ArrowDownToLine },
  invitation: { label: "Invitation", icon: Mail },
  "domain-capture": { label: "Domain capture", icon: Monitor },
  local: { label: "Local", icon: User },
};

// Expired = action required (re-send / revoke), surfaced as warning.
// Pending = in-flight invite, not alarming — muted neutral.
export const STATUS_META: Record<
  MemberStatus,
  { label: string; tone: "success" | "warning" | "muted" }
> = {
  accepted: { label: "Accepted", tone: "success" },
  pending: { label: "Pending", tone: "muted" },
  expired: { label: "Expired", tone: "warning" },
};

export const ROLE_VALUES: ReadonlyArray<Role> = ["owner", "admin", "member"];
export const SOURCE_VALUES: ReadonlyArray<MemberSource> = [
  "directory-sync",
  "invitation",
  "domain-capture",
  "local",
];
export const STATUS_VALUES: ReadonlyArray<MemberStatus> = [
  "accepted",
  "pending",
  "expired",
];

export const CHECK_ICON: LucideIcon = Check;
