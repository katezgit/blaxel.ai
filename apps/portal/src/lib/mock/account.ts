/**
 * Account-level mock fixtures: tier, credit balance, quotas, admins, billing
 * state. Single source of truth for every Account page + topbar chip pair.
 *
 * The current product's billing/quotas live behind multiple separate endpoints;
 * this module mirrors the eventual shape (typed fixtures = the contract) and
 * keeps Tier 0 Day-1 as the default seed. A dev toggle (URL `?tier=N` +
 * localStorage) flips the active tier so the demo can verify gated rows.
 */

import { currentOrg, orgList } from "@/lib/mock/data";
import type { Org } from "@/lib/mock/types";

export type Tier = 0 | 1 | 2 | 3;

export interface TierLimits {
  /** Sandboxes concurrent. `null` = unlimited (tier 3+ aspirational; never used in demo). */
  sandboxesConcurrent: number;
  /** Sandboxes total (lifetime), per current product quota table. */
  sandboxesTotal: number;
  /** Agent + MCP + Job shared count limit. */
  agentsMcpsJobs: number;
  /** Concurrent RAM ceiling for Batch Jobs (GB). */
  concurrentRamGb: number;
  /** Sandbox max lifetime in days (static ceiling). */
  sandboxMaxLifetimeDays: number;
  /** Memory per sandbox instance (MiB) (static ceiling). */
  memoryPerInstanceMib: number;
  /** Logs retention window in days (static ceiling). */
  logsRetentionDays: number;
  /** Volume count limit. `null` = not included on this tier. */
  volumes: number | null;
  /** Volume storage limit in GB. `null` = not included. */
  volumeStorageGb: number | null;
  /** Agent Drive count limit. `null` = not included. */
  agentDrives: number | null;
  /** Private previews. `null` = not included. */
  privatePreviews: number | null;
  /** Revisions per deployment. `null` = not included. */
  revisionsPerDeployment: number | null;
  /** Cron triggers. `null` = not included. */
  cronTriggers: number | null;
  /** Policies. `null` = not included. */
  policies: number | null;
  /** Custom domains. `null` = not included. */
  customDomains: number | null;
  /** Unlimited sandbox runtime (Tier 2+). */
  unlimitedSandboxRuntime: boolean;
  /** Workspaces allowed under this account. */
  workspaces: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  0: {
    sandboxesConcurrent: 10,
    sandboxesTotal: 10,
    agentsMcpsJobs: 5,
    concurrentRamGb: 4,
    sandboxMaxLifetimeDays: 7,
    memoryPerInstanceMib: 4096,
    logsRetentionDays: 3,
    volumes: null,
    volumeStorageGb: null,
    agentDrives: null,
    privatePreviews: null,
    revisionsPerDeployment: null,
    cronTriggers: null,
    policies: null,
    customDomains: null,
    unlimitedSandboxRuntime: false,
    workspaces: 1,
  },
  1: {
    sandboxesConcurrent: 20,
    sandboxesTotal: 50,
    agentsMcpsJobs: 20,
    concurrentRamGb: 64,
    sandboxMaxLifetimeDays: 7,
    memoryPerInstanceMib: 8192,
    logsRetentionDays: 14,
    volumes: 100,
    volumeStorageGb: 50,
    agentDrives: 10,
    privatePreviews: 5,
    revisionsPerDeployment: 10,
    cronTriggers: 20,
    policies: 20,
    customDomains: null,
    unlimitedSandboxRuntime: false,
    workspaces: 5,
  },
  2: {
    sandboxesConcurrent: 75,
    sandboxesTotal: 200,
    agentsMcpsJobs: 75,
    concurrentRamGb: 128,
    sandboxMaxLifetimeDays: 7,
    memoryPerInstanceMib: 16384,
    logsRetentionDays: 30,
    volumes: 400,
    volumeStorageGb: 200,
    agentDrives: 50,
    privatePreviews: 20,
    revisionsPerDeployment: 25,
    cronTriggers: 100,
    policies: 100,
    customDomains: null,
    unlimitedSandboxRuntime: true,
    workspaces: 20,
  },
  3: {
    sandboxesConcurrent: 200,
    sandboxesTotal: 800,
    agentsMcpsJobs: 200,
    concurrentRamGb: 256,
    sandboxMaxLifetimeDays: 7,
    memoryPerInstanceMib: 32768,
    logsRetentionDays: 30,
    volumes: 6000,
    volumeStorageGb: 3000,
    agentDrives: 200,
    privatePreviews: 50,
    revisionsPerDeployment: 50,
    cronTriggers: 500,
    policies: 500,
    customDomains: 20,
    unlimitedSandboxRuntime: true,
    workspaces: 50,
  },
};

export interface CurrentUsage {
  sandboxesConcurrent: number;
  sandboxesTotal: number;
  agentsMcpsJobs: number;
  concurrentRamGb: number;
  agents: number;
  mcpServers: number;
  batchJobsConcurrent: number;
  volumes: number;
  agentDrives: number;
  policies: number;
  customDomains: number;
}

export const DEFAULT_USAGE: CurrentUsage = {
  sandboxesConcurrent: 0,
  sandboxesTotal: 0,
  agentsMcpsJobs: 1,
  concurrentRamGb: 0,
  agents: 1,
  mcpServers: 1,
  batchJobsConcurrent: 1,
  volumes: 0,
  agentDrives: 0,
  policies: 0,
  customDomains: 0,
};

export type WalletEntryType = "promo" | "topup" | "purchase";

export interface WalletEntry {
  id: string;
  type: WalletEntryType;
  label: string;
  addedOn: string;
  /** Available credits in this wallet entry. */
  available: number;
  /** Initial credits granted by this entry. */
  initial: number;
  amount: number;
  /** ISO date string or `null` for non-expiring. */
  expiresOn: string | null;
}

export type CreditHistoryType = "Promo" | "Top-up" | "Purchase" | "Usage";

export interface CreditHistoryEntry {
  id: string;
  date: string;
  type: CreditHistoryType;
  description: string;
  /** Signed: positive = added, negative = consumed. */
  amount: number;
}

export type InvoiceStatus = "Paid" | "Open" | "Draft";

export interface Invoice {
  id: string;
  date: string;
  status: InvoiceStatus;
  amount: number;
  downloadHref: string;
}

export interface AutoTopUp {
  enabled: boolean;
  thresholdUsd: number;
  amountUsd: number;
}

export interface MonthlyTopUp {
  enabled: boolean;
  amountUsd: number;
}

export interface LowBalanceAlert {
  enabled: boolean;
  thresholdUsd: number;
}

export interface PaymentMethod {
  /** Brand label, e.g. "Visa". `null` = no payment method on file. */
  brand: string | null;
  last4: string | null;
}

export interface AccountIdentity {
  accountId: string;
  ownerEmail: string;
  ownerName: string;
}

export type AdminRole = "Owner" | "Admin";
export type AdminStatus = "active" | "pending";

export interface AccountAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  joinedAt: string;
  /** ISO timestamp the invitation was sent. Required when `status === "pending"`. */
  invitedAt?: string;
}

export type AddOnId = "premium-support" | "dedicated-support" | "hipaa";

export interface AddOn {
  id: AddOnId;
  name: string;
  priceUsd: number;
  description: string;
  /** Optional extra line under description (e.g. HIPAA BAA note). */
  secondaryDescription?: string;
  ctaLabel: "Add to account" | "Contact sales";
  active: boolean;
}

export type DomainVerification = "verified" | "pending";

export interface DomainPolicy {
  id: string;
  domain: string;
  verification: DomainVerification;
  /** Enforced login method. `null` while pending. */
  enforcedMethod: "Google" | "GitHub" | "Email" | "Any" | null;
  txtRecord: string;
}

export interface SamlConfiguration {
  /** `null` when not configured. */
  idpSsoUrl: string | null;
  certificateExpiresOn: string | null;
}

export interface MonthToDateSpend {
  /** Compute usage (sandboxes, jobs, agents, MCP, volumes, etc.) in USD. */
  usageUsd: number;
  /** Add-ons + extras (support tier, HIPAA, etc.) in USD. */
  addonsUsd: number;
}

export interface Receipt {
  id: string;
  date: string;
  /** Top-up or one-off purchase amount in USD. */
  amount: number;
  status: InvoiceStatus;
  /** "Visa ending 4242" — already-formatted display. */
  paymentMethodLabel: string;
  downloadHref: string;
}

export interface BillingContact {
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
}

export interface AccountState {
  tier: Tier;
  balanceUsd: number;
  identity: AccountIdentity;
  admins: ReadonlyArray<AccountAdmin>;
  workspaces: ReadonlyArray<Org>;
  usage: CurrentUsage;
  wallet: ReadonlyArray<WalletEntry>;
  creditHistory: ReadonlyArray<CreditHistoryEntry>;
  invoices: ReadonlyArray<Invoice>;
  receipts: ReadonlyArray<Receipt>;
  monthToDateSpendUsd: number;
  monthToDateSpendBreakdown: MonthToDateSpend;
  autoTopUp: AutoTopUp;
  monthlyTopUp: MonthlyTopUp;
  lowBalanceAlert: LowBalanceAlert;
  paymentMethod: PaymentMethod;
  billingContact: BillingContact;
  addons: ReadonlyArray<AddOn>;
  domains: ReadonlyArray<DomainPolicy>;
  saml: SamlConfiguration;
  earnCreditsRemaining: number;
}

const DAY_ONE_OWNER: AccountIdentity = {
  // UUID-style ID; the trailing `0010` distinguishes the demo account from
  // a real one. Stable across sessions because seeded statically.
  accountId: "00000000-0000-4000-8000-000000000010",
  ownerEmail: "demo@acme.dev",
  ownerName: "Demo User",
};

const DAY_ONE_OWNER_ADMIN: AccountAdmin = {
  id: "adm_owner",
  name: DAY_ONE_OWNER.ownerName,
  email: DAY_ONE_OWNER.ownerEmail,
  role: "Owner",
  status: "active",
  joinedAt: "2026-06-17",
};

const SEEDED_ACTIVE_ADMIN: AccountAdmin = {
  id: "adm_active_seed",
  name: "Maya Chen",
  email: "maya@acme.dev",
  role: "Admin",
  status: "active",
  joinedAt: "2026-06-18",
};

// Seed an invite that always reads as ~3 days old regardless of when the demo
// runs. Computed at module load so re-mounts of the provider stay consistent
// within a session; the demo doesn't persist mock state across reloads anyway.
const PENDING_INVITE_SENT_AT = new Date(
  Date.now() - 3 * 24 * 60 * 60 * 1000,
).toISOString();

const SEEDED_PENDING_ADMIN: AccountAdmin = {
  id: "adm_pending_seed",
  name: "Invited user",
  email: "rohan@acme.dev",
  role: "Admin",
  status: "pending",
  joinedAt: PENDING_INVITE_SENT_AT.slice(0, 10),
  invitedAt: PENDING_INVITE_SENT_AT,
};

/**
 * Account → Workspaces shows the same set of orgs the WorkspaceSwitcher reads
 * from (`orgList` in `mock/data.ts`). Tier 0 seeds a single workspace
 * (`currentOrg`); Tier 1+ expands to the full set the switcher knows about.
 */
const TIER_ZERO_WORKSPACES: ReadonlyArray<Org> = [currentOrg];
const TIER_UPGRADED_WORKSPACES: ReadonlyArray<Org> = orgList.map((m) => m.org);

const SIGNUP_PROMO_WALLET: WalletEntry = {
  id: "wal_signup_promo",
  type: "promo",
  label: "Sign-up promo",
  addedOn: "2026-06-17",
  available: 10,
  initial: 10,
  amount: 10,
  expiresOn: "2027-05-31",
};

const SIGNUP_PROMO_HISTORY: CreditHistoryEntry = {
  id: "ch_signup_promo",
  date: "2026-06-17",
  type: "Promo",
  description: "Welcome credits for new account",
  amount: 10,
};

const TIER_ONE_TOPUP_WALLET: WalletEntry = {
  id: "wal_first_topup",
  type: "topup",
  label: "Manual top-up",
  addedOn: "2026-06-18",
  available: 47.12,
  initial: 50,
  amount: 50,
  expiresOn: null,
};

const TIER_ONE_TOPUP_HISTORY: CreditHistoryEntry = {
  id: "ch_first_topup",
  date: "2026-06-18",
  type: "Top-up",
  description: "Top-up via Visa ending 4242",
  amount: 50,
};

const TIER_ONE_USAGE_HISTORY: CreditHistoryEntry = {
  id: "ch_first_usage",
  date: "2026-06-19",
  type: "Usage",
  description: "Sandbox compute",
  amount: -2.88,
};

// Activity in the days after the first top-up: a steady drip of usage rows
// plus a second top-up and a referral promo. Newest entries last in the seed;
// the table sorts them newest-first on render.
const TIER_ONE_EXTENDED_HISTORY: ReadonlyArray<CreditHistoryEntry> = [
  {
    id: "ch_usage_06_20",
    date: "2026-06-20",
    type: "Usage",
    description: "Agent invocations",
    amount: -1.42,
  },
  {
    id: "ch_usage_06_21",
    date: "2026-06-21",
    type: "Usage",
    description: "MCP server requests",
    amount: -3.17,
  },
  {
    id: "ch_promo_referral",
    date: "2026-06-22",
    type: "Promo",
    description: "Referral bonus",
    amount: 25,
  },
  {
    id: "ch_usage_06_23",
    date: "2026-06-23",
    type: "Usage",
    description: "Sandbox compute",
    amount: -2.05,
  },
  {
    id: "ch_topup_06_25",
    date: "2026-06-25",
    type: "Top-up",
    description: "Top-up via Visa ending 4242",
    amount: 25,
  },
  {
    id: "ch_usage_06_26",
    date: "2026-06-26",
    type: "Usage",
    description: "Sandbox compute",
    amount: -4.93,
  },
  {
    id: "ch_usage_06_27",
    date: "2026-06-27",
    type: "Usage",
    description: "Batch job execution",
    amount: -1.88,
  },
  {
    id: "ch_usage_06_28",
    date: "2026-06-28",
    type: "Usage",
    description: "MCP server requests",
    amount: -0.45,
  },
];

const TIER_ONE_INVOICE: Invoice = {
  id: "inv_2026_06",
  date: "2026-06-30",
  status: "Open",
  amount: 2.88,
  downloadHref: "/account/billing/invoices-payment#invoice-inv_2026_06",
};

const TIER_ONE_RECEIPT: Receipt = {
  id: "rcpt_2026_06_18",
  date: "2026-06-18",
  amount: 50,
  status: "Paid",
  paymentMethodLabel: "Visa ending 4242",
  downloadHref: "/account/billing/invoices-payment#receipt-rcpt_2026_06_18",
};

const DAY_ONE_BILLING_CONTACT: BillingContact = {
  email: "demo@acme.dev",
  address: {
    line1: "350 Bryant St",
    city: "San Francisco",
    region: "CA",
    postalCode: "94107",
    country: "United States",
  },
};

const ADD_ONS_TEMPLATE: ReadonlyArray<AddOn> = [
  {
    id: "premium-support",
    name: "Premium support",
    priceUsd: 500,
    description: "Priority support for teams that need faster responses.",
    ctaLabel: "Add to account",
    active: false,
  },
  {
    id: "dedicated-support",
    name: "Dedicated support",
    priceUsd: 1000,
    description:
      "A dedicated support contact for production teams with advanced needs.",
    ctaLabel: "Add to account",
    active: false,
  },
  {
    id: "hipaa",
    name: "HIPAA compliance",
    priceUsd: 500,
    description: "Run eligible workloads with HIPAA compliance support.",
    secondaryDescription:
      "BAA-eligible. Contact sales to confirm scope of covered services.",
    ctaLabel: "Contact sales",
    active: false,
  },
];

function tier0Seed(): AccountState {
  return {
    tier: 0,
    balanceUsd: 10,
    identity: DAY_ONE_OWNER,
    admins: [DAY_ONE_OWNER_ADMIN, SEEDED_ACTIVE_ADMIN, SEEDED_PENDING_ADMIN],
    workspaces: TIER_ZERO_WORKSPACES,
    usage: { ...DEFAULT_USAGE },
    wallet: [SIGNUP_PROMO_WALLET],
    creditHistory: [SIGNUP_PROMO_HISTORY],
    invoices: [],
    receipts: [],
    monthToDateSpendUsd: 0,
    monthToDateSpendBreakdown: { usageUsd: 0, addonsUsd: 0 },
    autoTopUp: { enabled: false, thresholdUsd: 5, amountUsd: 25 },
    monthlyTopUp: { enabled: false, amountUsd: 50 },
    lowBalanceAlert: { enabled: true, thresholdUsd: 25 },
    paymentMethod: { brand: null, last4: null },
    billingContact: DAY_ONE_BILLING_CONTACT,
    addons: ADD_ONS_TEMPLATE,
    domains: [],
    saml: { idpSsoUrl: null, certificateExpiresOn: null },
    earnCreditsRemaining: 6,
  };
}

function tierUpgradedSeed(tier: Tier): AccountState {
  const upgraded = tier0Seed();
  upgraded.tier = tier;
  upgraded.balanceUsd = 93.22;
  upgraded.paymentMethod = { brand: "Visa", last4: "4242" };
  upgraded.wallet = [SIGNUP_PROMO_WALLET, TIER_ONE_TOPUP_WALLET];
  upgraded.creditHistory = [
    SIGNUP_PROMO_HISTORY,
    TIER_ONE_TOPUP_HISTORY,
    TIER_ONE_USAGE_HISTORY,
    ...TIER_ONE_EXTENDED_HISTORY,
  ];
  upgraded.invoices = [TIER_ONE_INVOICE];
  upgraded.receipts = [TIER_ONE_RECEIPT];
  upgraded.monthToDateSpendUsd = 2.88;
  upgraded.monthToDateSpendBreakdown = { usageUsd: 2.88, addonsUsd: 0 };
  upgraded.autoTopUp = { enabled: true, thresholdUsd: 10, amountUsd: 50 };
  upgraded.usage = {
    ...DEFAULT_USAGE,
    sandboxesConcurrent: 3,
    sandboxesTotal: 5,
    volumes: 2,
    agentDrives: 1,
    policies: 1,
  };
  upgraded.workspaces = TIER_UPGRADED_WORKSPACES;
  return upgraded;
}

export function seedForTier(tier: Tier): AccountState {
  return tier === 0 ? tier0Seed() : tierUpgradedSeed(tier);
}
