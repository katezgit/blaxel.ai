"use client";

import Link from "next/link";
import {
  Building2,
  CreditCard,
  KeyboardIcon,
  LogOutIcon,
  Palette,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/cn";
import { signOut } from "@/lib/auth/actions";
import { useAccountState } from "@/lib/mock/account-context";
import ThemeSwitcher from "@/components/shell/theme-switcher";

interface AvatarMenuProps {
  user: { name: string; email: string; tier: string };
}

export default function AvatarMenu({ user }: AvatarMenuProps) {
  const { state } = useAccountState();
  const hasBalance = Number.isFinite(state.balanceUsd);
  const balanceLabel = hasBalance ? `$${state.balanceUsd.toFixed(2)}` : "$—";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={cn(
          "flex size-8 items-center justify-center rounded-full focus-visible:shadow-focus-ring",
          "hover:bg-hover-surface",
        )}
      >
        <Avatar size="sm">
          <AvatarFallback>{user.name.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="flex items-center gap-3 px-2 pt-2 pb-3 border-b border-border">
          <Avatar size="sm">
            <AvatarFallback>{user.name.charAt(0) || "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="typography-label font-semibold text-foreground truncate">
              {user.name}
            </div>
            <div className="font-mono typography-caption text-meta-foreground truncate">
              {user.email}
            </div>
          </div>
        </div>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="items-start">
            <User aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="flex flex-1 flex-col gap-0.5 leading-tight">
              <span>Profile</span>
              <span className="typography-caption text-meta-foreground">
                Personal settings
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/admins" className="items-start">
            <Building2 aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="flex flex-1 flex-col gap-0.5 leading-tight">
              <span>Account</span>
              <span className="typography-caption text-meta-foreground">
                Team, workspaces, and access
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/billing/credits" className="items-start">
            <CreditCard aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="flex flex-1 flex-col gap-0.5 leading-tight">
              <span>Plan &amp; billing</span>
              <span className="typography-caption text-meta-foreground tabular-nums">
                Tier {state.tier} &middot; {balanceLabel} credits
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => undefined}>
          <KeyboardIcon aria-hidden="true" />
          <span>Help &amp; shortcuts</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          asChild
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between gap-2 pl-2 pr-0 py-1.5">
            <div className="flex items-center gap-2">
              <Palette aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground">Appearance</span>
            </div>
            <ThemeSwitcher />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            void signOut();
          }}
        >
          <LogOutIcon aria-hidden="true" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
