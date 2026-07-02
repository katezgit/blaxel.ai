"use client";

import { useState } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import {
  Calendar,
  ChevronDown,
  Clock,
  Plus,
  Settings2,
  Timer,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

type ScheduleType = "cron" | "one-time" | "delay";
type ScheduleMode = "presets" | "custom" | "advanced";
type DelayUnit = "seconds" | "minutes" | "hours" | "days";

interface FormValues {
  type: ScheduleType;
  command: string;
  // cron branch
  scheduleMode: ScheduleMode;
  presetKey: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  dow: string;
  advancedExpr: string;
  // one-time branch
  runAt: string;
  // delay branch
  delayN: string;
  delayUnit: DelayUnit;
  // advanced disclosure
  timezone: string;
  onFailure: string;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

interface CronPreset {
  key: string;
  label: string;
  cron: string;
  description: string;
}

const CRON_PRESETS: ReadonlyArray<CronPreset> = [
  {
    key: "every-minute",
    label: "Every minute",
    cron: "* * * * *",
    description: "Runs every minute",
  },
  {
    key: "every-5-minutes",
    label: "Every 5 minutes",
    cron: "*/5 * * * *",
    description: "Runs every 5 minutes",
  },
  {
    key: "every-15-minutes",
    label: "Every 15 minutes",
    cron: "*/15 * * * *",
    description: "Runs every 15 minutes",
  },
  {
    key: "every-hour",
    label: "Every hour",
    cron: "0 * * * *",
    description: "At the top of every hour",
  },
  {
    key: "every-day",
    label: "Every day at midnight",
    cron: "0 0 * * *",
    description: "Runs daily at 00:00 UTC",
  },
  {
    key: "every-monday",
    label: "Every Monday",
    cron: "0 0 * * 1",
    description: "Runs weekly on Monday at 00:00 UTC",
  },
  {
    key: "every-1st",
    label: "Every 1st of month",
    cron: "0 0 1 * *",
    description: "Runs monthly on the 1st at 00:00 UTC",
  },
];

const MINUTE_OPTIONS = [
  { value: "*", label: "Every minute (*)" },
  { value: "*/5", label: "Every 5 minutes (*/5)" },
  { value: "*/10", label: "Every 10 minutes (*/10)" },
  { value: "*/15", label: "Every 15 minutes (*/15)" },
  { value: "*/30", label: "Every 30 minutes (*/30)" },
  { value: "0", label: "At minute 0" },
  { value: "15", label: "At minute 15" },
  { value: "30", label: "At minute 30" },
  { value: "45", label: "At minute 45" },
];

const HOUR_OPTIONS = [
  { value: "*", label: "Every hour (*)" },
  { value: "*/2", label: "Every 2 hours (*/2)" },
  { value: "*/4", label: "Every 4 hours (*/4)" },
  { value: "*/6", label: "Every 6 hours (*/6)" },
  { value: "*/12", label: "Every 12 hours (*/12)" },
  { value: "0", label: "At 00:00" },
  { value: "6", label: "At 06:00" },
  { value: "12", label: "At 12:00" },
  { value: "18", label: "At 18:00" },
];

const DAY_OPTIONS = [
  { value: "*", label: "Every day (*)" },
  { value: "1", label: "1st" },
  { value: "15", label: "15th" },
  { value: "L", label: "Last day (L)" },
];

const MONTH_OPTIONS = [
  { value: "*", label: "Every month (*)" },
  { value: "1", label: "Jan (1)" },
  { value: "2", label: "Feb (2)" },
  { value: "3", label: "Mar (3)" },
  { value: "4", label: "Apr (4)" },
  { value: "5", label: "May (5)" },
  { value: "6", label: "Jun (6)" },
  { value: "7", label: "Jul (7)" },
  { value: "8", label: "Aug (8)" },
  { value: "9", label: "Sep (9)" },
  { value: "10", label: "Oct (10)" },
  { value: "11", label: "Nov (11)" },
  { value: "12", label: "Dec (12)" },
];

const DOW_OPTIONS = [
  { value: "*", label: "Every day (*)" },
  { value: "0", label: "Sun (0)" },
  { value: "1", label: "Mon (1)" },
  { value: "2", label: "Tue (2)" },
  { value: "3", label: "Wed (3)" },
  { value: "4", label: "Thu (4)" },
  { value: "5", label: "Fri (5)" },
  { value: "6", label: "Sat (6)" },
  { value: "1-5", label: "Weekdays (1-5)" },
  { value: "0,6", label: "Weekends (0,6)" },
];

const TIMEZONE_OPTIONS = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
];

const ON_FAILURE_OPTIONS = [
  { value: "continue", label: "Continue" },
  { value: "alert", label: "Alert" },
  { value: "retry-once", label: "Retry once" },
  { value: "retry-3x", label: "Retry 3x" },
];

const DELAY_UNIT_OPTIONS: ReadonlyArray<{ value: DelayUnit; label: string }> = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

// ── Cron helpers ──────────────────────────────────────────────────────────────

// A single cron field: `*`, `*/N`, `N`, `N,N`, `N-N`, or `L` (day-of-month only).
// Deliberately permissive — the demo doesn't need RFC-grade parsing, just
// enough to distinguish "user typed garbage" from "user has a plausible pattern".
const CRON_FIELD = /^(\*|L|(\*\/[0-9]+)|([0-9]+)(-[0-9]+)?(,[0-9]+(-[0-9]+)?)*)$/;

function isCronValid(expr: string): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  return parts.every((p) => CRON_FIELD.test(p));
}

function describeCron(expr: string): string {
  const preset = CRON_PRESETS.find((p) => p.cron === expr);
  if (preset) return preset.description;
  if (!isCronValid(expr)) return "Invalid cron pattern";
  return "Custom schedule";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SandboxSchedulesAddDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button type="button" variant="primary">
          <Plus aria-hidden="true" />
          Add schedule
        </Button>
      </DrawerTrigger>
      <DrawerContent size="md" aria-describedby={undefined}>
        {open && <AddScheduleForm onClose={() => setOpen(false)} />}
      </DrawerContent>
    </Drawer>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────

interface AddScheduleFormProps {
  onClose: () => void;
}

function AddScheduleForm({ onClose }: AddScheduleFormProps) {
  const { control, handleSubmit, register, reset } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      type: "cron",
      command: "",
      scheduleMode: "presets",
      presetKey: CRON_PRESETS[0]!.key,
      minute: "*",
      hour: "*",
      day: "*",
      month: "*",
      dow: "*",
      advancedExpr: "* * * * *",
      runAt: "",
      delayN: "30",
      delayUnit: "minutes",
      timezone: "UTC",
      onFailure: "continue",
    },
  });

  const values = useWatch({ control });
  const cronExpr = deriveCron(values);
  const submittable = isSubmittable(values, cronExpr);

  const onSubmit = handleSubmit(() => {
    toast.success("Schedule added");
    reset();
    onClose();
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full min-h-0 flex-col"
    >
      <DrawerHeader className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <DrawerTitle>Add schedule</DrawerTitle>
          <DrawerDescription>
            Schedule a command to run inside this sandbox on a cron, at a
            specific time, or after a delay.
          </DrawerDescription>
        </div>
        <DrawerCloseButton />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-6">
        <TypeField control={control} />

        {values.type === "cron" && (
          <>
            <ScheduleField control={control} />
            <CurrentSchedulePreview cronExpr={cronExpr} />
          </>
        )}

        {values.type === "one-time" && (
          <FormField id="add-schedule-run-at" label="Run at">
            <Input
              {...register("runAt")}
              placeholder="YYYY-MM-DD HH:mm UTC"
              className="font-mono"
              autoComplete="off"
            />
          </FormField>
        )}

        {values.type === "delay" && <DelayFields control={control} register={register} />}

        <FormField id="add-schedule-command" label="Command">
          <Input
            {...register("command")}
            placeholder="e.g. python train.py --epochs 10"
            className="font-mono"
            autoComplete="off"
          />
        </FormField>

        <AdvancedDisclosure control={control} />
      </DrawerBody>

      <DrawerFooter className="flex justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!submittable}>
          Add schedule
        </Button>
      </DrawerFooter>
    </form>
  );
}

// ── Type field ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: ReadonlyArray<{
  value: ScheduleType;
  label: string;
  Icon: typeof Clock;
}> = [
  { value: "cron", label: "Cron", Icon: Clock },
  { value: "one-time", label: "One-time", Icon: Calendar },
  { value: "delay", label: "Delay", Icon: Timer },
];

function TypeField({ control }: { control: Control<FormValues> }) {
  return (
    <FormField id="add-schedule-type" label="Type">
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full" aria-label="Schedule type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                <SelectItem key={value} value={value}>
                  <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

// ── Schedule field (cron branch) ──────────────────────────────────────────────

function ScheduleField({ control }: { control: Control<FormValues> }) {
  const mode = useWatch({ control, name: "scheduleMode" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Schedule</Label>
        <Controller
          control={control}
          name="scheduleMode"
          render={({ field }) => (
            <SegmentedControl
              value={field.value}
              onValueChange={(v) => field.onChange(v as ScheduleMode)}
              aria-label="Schedule mode"
              className="w-full"
            >
              <SegmentedControl.Item value="presets" className="flex-1">
                <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                Presets
              </SegmentedControl.Item>
              <SegmentedControl.Item value="custom" className="flex-1">
                <Calendar aria-hidden="true" className="size-3.5 shrink-0" />
                Custom
              </SegmentedControl.Item>
              <SegmentedControl.Item value="advanced" className="flex-1">
                <Settings2 aria-hidden="true" className="size-3.5 shrink-0" />
                Advanced
              </SegmentedControl.Item>
            </SegmentedControl>
          )}
        />
      </div>

      {mode === "presets" && <PresetsBody control={control} />}
      {mode === "custom" && <CustomBody control={control} />}
      {mode === "advanced" && <AdvancedBody control={control} />}
    </div>
  );
}

function PresetsBody({ control }: { control: Control<FormValues> }) {
  return (
    <FormField id="add-schedule-preset" label="Choose a preset schedule">
      <Controller
        control={control}
        name="presetKey"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger
              className="h-auto w-full py-2"
              aria-label="Preset schedule"
            >
              <PresetTriggerLabel presetKey={field.value} />
            </SelectTrigger>
            <SelectContent>
              {CRON_PRESETS.map((preset) => (
                <SelectItem
                  key={preset.key}
                  value={preset.key}
                  renderItem={() => (
                    <div className="flex w-full min-w-0 items-center gap-3">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="typography-body text-foreground">
                          {preset.label}
                        </span>
                        <span className="typography-caption text-muted-foreground">
                          {preset.description}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-sm bg-muted-surface px-1.5 py-0.5 font-mono typography-code text-meta-foreground">
                        {preset.cron}
                      </span>
                    </div>
                  )}
                >
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

function PresetTriggerLabel({ presetKey }: { presetKey: string }) {
  const preset =
    CRON_PRESETS.find((p) => p.key === presetKey) ?? CRON_PRESETS[0]!;
  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <span className="typography-body text-foreground">{preset.label}</span>
        <span className="typography-caption text-muted-foreground">
          {preset.description}
        </span>
      </div>
      <span className="shrink-0 rounded-sm bg-muted-surface px-1.5 py-0.5 font-mono typography-code text-meta-foreground">
        {preset.cron}
      </span>
    </div>
  );
}

function CustomBody({ control }: { control: Control<FormValues> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <CronFieldSelect
          control={control}
          name="minute"
          id="add-schedule-minute"
          label="Minute (0-59)"
          options={MINUTE_OPTIONS}
        />
        <CronFieldSelect
          control={control}
          name="hour"
          id="add-schedule-hour"
          label="Hour (0-23)"
          options={HOUR_OPTIONS}
        />
        <CronFieldSelect
          control={control}
          name="day"
          id="add-schedule-day"
          label="Day (1-31)"
          options={DAY_OPTIONS}
        />
        <CronFieldSelect
          control={control}
          name="month"
          id="add-schedule-month"
          label="Month (1-12)"
          options={MONTH_OPTIONS}
        />
      </div>
      <CronFieldSelect
        control={control}
        name="dow"
        id="add-schedule-dow"
        label="Day of Week"
        options={DOW_OPTIONS}
      />
    </div>
  );
}

function CronFieldSelect({
  control,
  name,
  id,
  label,
  options,
}: {
  control: Control<FormValues>;
  name: "minute" | "hour" | "day" | "month" | "dow";
  id: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <FormField id={id} label={label}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full" aria-label={label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

function AdvancedBody({ control }: { control: Control<FormValues> }) {
  return (
    <FormField
      id="add-schedule-advanced-expr"
      label="Cron Expression"
      helper="Format: minute hour day month day-of-week"
    >
      <Controller
        control={control}
        name="advancedExpr"
        render={({ field }) => (
          <Input
            value={field.value}
            onChange={field.onChange}
            placeholder="* * * * *"
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      />
    </FormField>
  );
}

// ── Current-schedule preview ──────────────────────────────────────────────────

function CurrentSchedulePreview({ cronExpr }: { cronExpr: string }) {
  const description = describeCron(cronExpr);

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-3 py-2.5">
      <div className="flex min-w-0 flex-col">
        <span className="typography-label font-medium text-foreground">
          Current Schedule
        </span>
        <span className="typography-caption text-muted-foreground">
          {description}
        </span>
      </div>
      <span className="shrink-0 rounded-sm bg-muted-surface px-2 py-1 font-mono typography-code text-foreground">
        {cronExpr || "—"}
      </span>
    </div>
  );
}

// ── Delay branch ──────────────────────────────────────────────────────────────

function DelayFields({
  control,
  register,
}: {
  control: Control<FormValues>;
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-4">
      <FormField id="add-schedule-delay-n" label="Delay by">
        <Input
          {...register("delayN")}
          type="number"
          min={0}
          placeholder="30"
          autoComplete="off"
        />
      </FormField>
      <FormField id="add-schedule-delay-unit" label="Unit">
        <Controller
          control={control}
          name="delayUnit"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => field.onChange(v as DelayUnit)}
            >
              <SelectTrigger className="w-full" aria-label="Delay unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_UNIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
    </div>
  );
}

// ── Advanced disclosure (bottom) ──────────────────────────────────────────────

function AdvancedDisclosure({ control }: { control: Control<FormValues> }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-1.5 py-1 text-left",
            "typography-body font-medium text-foreground",
            "hover:text-foreground/80",
          )}
          aria-expanded={open}
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 text-muted-foreground",
              "transition-transform duration-fast ease-out-standard",
              !open && "-rotate-90",
            )}
          />
          Advanced
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:overflow-visible">
        <div className="flex flex-col gap-4 pt-3">
          <FormField id="add-schedule-timezone" label="Timezone">
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-label="Timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField id="add-schedule-on-failure" label="On failure">
            <Controller
              control={control}
              name="onFailure"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-label="On failure">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ON_FAILURE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Derivation ────────────────────────────────────────────────────────────────

function deriveCron(values: Partial<FormValues>): string {
  if (values.scheduleMode === "advanced") {
    return values.advancedExpr ?? "";
  }
  if (values.scheduleMode === "custom") {
    const { minute = "*", hour = "*", day = "*", month = "*", dow = "*" } = values;
    return `${minute} ${hour} ${day} ${month} ${dow}`;
  }
  const preset = CRON_PRESETS.find((p) => p.key === values.presetKey);
  return preset?.cron ?? CRON_PRESETS[0]!.cron;
}

function isSubmittable(values: Partial<FormValues>, cronExpr: string): boolean {
  const command = (values.command ?? "").trim();
  if (command.length === 0) return false;
  if (values.type === "cron") return isCronValid(cronExpr);
  if (values.type === "one-time") return (values.runAt ?? "").trim().length > 0;
  if (values.type === "delay") {
    const n = Number(values.delayN);
    return Number.isFinite(n) && n > 0;
  }
  return false;
}
