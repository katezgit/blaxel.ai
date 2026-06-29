import { cn } from "@repo/ui/lib/cn";

interface ProgressStripProps {
  currentStep: 1 | 2;
}

export default function ProgressStrip({ currentStep }: ProgressStripProps) {
  const dots: ReadonlyArray<"complete" | "active" | "upcoming"> = [
    currentStep === 1 ? "active" : "complete",
    currentStep === 2 ? "active" : "upcoming",
  ];

  return (
    <ol
      aria-label={`Step ${currentStep} of 2`}
      className="flex items-center gap-1.5"
    >
      {dots.map((state, index) => (
        <li
          key={index}
          aria-current={state === "active" ? "step" : undefined}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            state === "active" && "bg-primary",
            state === "complete" && "bg-primary/60",
            state === "upcoming" && "bg-muted-foreground/30",
          )}
        />
      ))}
    </ol>
  );
}
