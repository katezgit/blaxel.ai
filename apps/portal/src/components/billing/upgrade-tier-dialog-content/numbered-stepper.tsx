"use client";

import { Check } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";

interface StepDef {
  /** Visible step label, e.g. "Choose how much to top-up". */
  label: string;
}

interface NumberedStepperProps {
  /** Ordered list of steps to render. Numerals come from index + 1. */
  steps: ReadonlyArray<StepDef>;
  /** 1-based index of the active step. */
  currentStep: number;
}

// Two-state numerals (active filled / future muted) with a check on completed.
// Connector is a single hairline rule that fills the gap between circles.
// Lives in the One-time flow only; Monthly keeps its existing chrome.
export default function NumberedStepper({
  steps,
  currentStep,
}: NumberedStepperProps) {
  return (
    <ol
      aria-label="Top-up progress"
      className="flex items-center gap-3"
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isFuture = stepNumber > currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.label} className="flex flex-1 items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full font-mono typography-caption font-semibold tabular-nums",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-state-scored-soft text-state-scored",
                  isFuture && "bg-hover-surface text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : (
                  stepNumber
                )}
              </span>
              <span
                className={cn(
                  "typography-body",
                  isActive && "font-medium text-foreground",
                  isCompleted && "text-foreground",
                  isFuture && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {isLast ? null : (
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-border"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
