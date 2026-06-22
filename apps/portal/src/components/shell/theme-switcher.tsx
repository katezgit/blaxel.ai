"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

const THEMES = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];

export default function ThemeSwitcher() {
  // next-themes resolves the active theme on the client only; gate render to
  // avoid hydration mismatch on the indicator's data-state=on attribute.
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);

  const current = (mounted ? (theme ?? "system") : "system") as ThemeValue;

  return (
    <SegmentedControl
      value={current}
      onValueChange={(v) => setTheme(v)}
      aria-label="Theme"
      className="h-7"
    >
      {THEMES.map(({ value, label, Icon }) => (
        <SegmentedControl.Item
          key={value}
          value={value}
          aria-label={`Switch to ${label} theme`}
          className="h-full aspect-square px-0 [&_svg]:size-3.5"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Icon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </SegmentedControl.Item>
      ))}
    </SegmentedControl>
  );
}
