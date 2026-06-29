"use client";

import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Info,
  MessageCircle,
  Newspaper,
  PartyPopper,
  RotateCcw,
  Users,
} from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

const externalItemClass =
  "[&_[data-arrow]]:opacity-0 data-[highlighted]:[&_[data-arrow]]:opacity-100";

function ExternalArrow() {
  return (
    <ArrowUpRight
      data-arrow
      aria-hidden="true"
      className="ml-auto size-3.5 transition-opacity"
    />
  );
}

export default function HelpMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="md"
          aria-label="Help and resources"
          className="[&_svg]:size-5 [&_svg]:text-muted-foreground hover:[&_svg]:text-foreground"
        >
          <Info />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem asChild className={externalItemClass}>
          <a href="https://docs.blaxel.ai" target="_blank" rel="noreferrer">
            <BookOpen aria-hidden="true" />
            <span>Documentation</span>
            <ExternalArrow />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={externalItemClass}>
          <a
            href="https://docs.blaxel.ai/api-reference"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 aria-hidden="true" />
            <span>API Reference</span>
            <ExternalArrow />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={externalItemClass}>
          <a href="https://status.blaxel.ai" target="_blank" rel="noreferrer">
            <span
              aria-hidden="true"
              className="flex size-4 items-center justify-center"
            >
              <span className="size-2 rounded-full bg-state-scored" />
            </span>
            <span>All systems operational</span>
            <ExternalArrow />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className={externalItemClass}>
          <a href="https://discord.gg/blaxel" target="_blank" rel="noreferrer">
            <Users aria-hidden="true" />
            <span>Discord community</span>
            <ExternalArrow />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={externalItemClass}>
          <a
            href="https://docs.blaxel.ai/changelog"
            target="_blank"
            rel="noreferrer"
          >
            <PartyPopper aria-hidden="true" />
            <span>What&apos;s new</span>
            <ExternalArrow />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={externalItemClass}>
          <a href="https://blaxel.ai/blog" target="_blank" rel="noreferrer">
            <Newspaper aria-hidden="true" />
            <span>Blog</span>
            <ExternalArrow />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => undefined}>
          <RotateCcw aria-hidden="true" />
          <span>Replay onboarding</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => undefined}>
          <MessageCircle aria-hidden="true" />
          <span>Contact support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-center gap-2 px-2 py-1.5 typography-caption text-muted-foreground">
          <a
            href="https://blaxel.ai/privacy"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Privacy
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://blaxel.ai/terms"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Terms
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
