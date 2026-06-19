"use client";

import { useTheme } from "next-themes";
import { SegmentedControl } from "@repo/ui/components/segmented-control";

type ThemeChoice = "light" | "dark" | "system";

const OPTIONS: ReadonlyArray<{ value: ThemeChoice; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemePreferenceField() {
  const { theme, setTheme } = useTheme();
  const current = (theme ?? "system") as ThemeChoice;

  return (
    <div className="flex flex-col items-start gap-1">
      <SegmentedControl
        aria-label="Theme"
        value={current}
        onValueChange={(next) => {
          if (next) setTheme(next);
        }}
      >
        {OPTIONS.map((opt) => (
          <SegmentedControl.Item key={opt.value} value={opt.value}>
            {opt.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>
      <p className="text-caption text-muted-foreground">
        Applies across all your workspaces.
      </p>
    </div>
  );
}
