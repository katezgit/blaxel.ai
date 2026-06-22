import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type AriaAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

interface PanelProps {
  title?: string;
  /**
   * Optional one-line description sitting tight under the title. Use for
   * editorial "what does this section do" copy, where the children below are
   * the actionable controls. Renders as muted body text.
   */
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Optional right-aligned slot rendered next to the panel title. */
  action?: ReactNode;
}

/**
 * Settings panel — wraps content in a `Card` with a structural title row.
 * Title is optional so panels can omit headers when the page already has one.
 */
export function Panel({ title, subtitle, action, children, className }: PanelProps) {
  const hasHeader = title || action || subtitle;
  return (
    <Card className={cn("mb-4 px-6 py-6", className)}>
      {hasHeader ? (
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            {title ? (
              <h2 className="typography-subtitle font-semibold text-foreground">{title}</h2>
            ) : <span />}
            {action}
          </div>
          {subtitle ? (
            <p className="typography-body text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

interface FieldRowProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}

const FIELD_ROW_GRID: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export function FieldRow({ children, className, cols = 2 }: FieldRowProps) {
  return (
    <div className={cn("grid gap-4", FIELD_ROW_GRID[cols], className)}>{children}</div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}

export function Field({ label, children, hint, error }: FieldProps) {
  const baseId = useId();
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = error ? errorId : hintId;
  const footer = renderFieldFooter({ error, hint, hintId, errorId });

  // Forward aria-describedby and aria-invalid onto the single form control
  // child so SR users hear the hint/error when the input is focused.
  const enriched = enrichControlChild(children, { describedBy, hasError: Boolean(error) });

  return (
    <label className="flex flex-col gap-1.5 typography-label">
      <span className="text-muted-foreground">{label}</span>
      {enriched}
      {footer}
    </label>
  );
}

interface FormControlProps extends AriaAttributes {
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
}

function enrichControlChild(
  children: ReactNode,
  { describedBy, hasError }: { describedBy?: string; hasError: boolean },
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const existing = (child.props as FormControlProps) ?? {};
    const mergedDescribedBy =
      [existing["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined;
    const next: FormControlProps = {};
    if (mergedDescribedBy) next["aria-describedby"] = mergedDescribedBy;
    if (hasError && existing["aria-invalid"] === undefined) {
      next["aria-invalid"] = true;
    }
    return cloneElement(child as ReactElement<FormControlProps>, next);
  });
}

function renderFieldFooter({
  error,
  hint,
  hintId,
  errorId,
}: {
  error?: string;
  hint?: string;
  hintId?: string;
  errorId?: string;
}) {
  if (error) {
    return (
      <span
        id={errorId}
        role="alert"
        className="typography-caption font-medium text-state-errored-text"
      >
        {error}
      </span>
    );
  }
  if (hint) {
    return (
      <span id={hintId} className="typography-caption text-meta-foreground">
        {hint}
      </span>
    );
  }
  return null;
}
