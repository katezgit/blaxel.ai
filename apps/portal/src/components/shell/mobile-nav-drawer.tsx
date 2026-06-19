"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { IconButton } from "@repo/ui/components/icon-button";
import { BrandWordmark } from "@/components/shell/brand-mark";
import { MobileNavBody } from "@/components/shell/mobile-nav-body";
import type { NavGroup } from "@/components/shell/nav-groups";

interface MobileNavDrawerProps {
  id: string;
  ariaLabel: string;
  groups: ReadonlyArray<NavGroup>;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** Optional row rendered above the first group inside the drawer body. */
  header?: (close: () => void) => ReactNode;
}

export function MobileNavDrawer({
  id,
  ariaLabel,
  groups,
  open,
  onOpenChange,
  header,
}: MobileNavDrawerProps) {
  const close = () => onOpenChange(false);
  return (
    <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        id={id}
        size="sm"
        className="data-[vaul-drawer-direction=left]:w-(--mobile-drawer-w) bg-muted-surface"
        aria-label={ariaLabel}
      >
        <DrawerTitle className="sr-only">{ariaLabel}</DrawerTitle>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2 pt-6">
            <BrandWordmark />
            <DrawerClose asChild>
              <IconButton variant="ghost" size="md" aria-label="Close navigation">
                <X />
              </IconButton>
            </DrawerClose>
          </div>
          <MobileNavBody
            ariaLabel={ariaLabel}
            groups={groups}
            onNavigate={close}
            header={header?.(close)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
