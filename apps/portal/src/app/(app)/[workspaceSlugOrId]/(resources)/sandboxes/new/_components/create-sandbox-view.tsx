"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { useCurrentTenancy } from "@/lib/query/tenancy-context";
import { sandboxQueries } from "@/lib/query/sandboxes";
import { volumeQueries } from "@/lib/query/volumes";
import { findSandboxImage, type SandboxImage } from "@/lib/mock/sandbox-images";
import {
  INITIAL_STATE,
  applyImageDefaults,
  isValidSandboxName,
  readStepParam,
  type CreateFormState,
  type CreateStep,
} from "./form-state";
import { StepImage } from "./step-image";
import { StepResources } from "./step-resources";
import { StepConfirm } from "./step-confirm";
import { SdkGuide } from "./sdk-guide";
import { SummaryRail } from "./summary-rail";

interface CreateSandboxViewProps {
  workspaceSlug: string;
}

const STEP_ORDER: ReadonlyArray<CreateStep> = ["image", "resources", "confirm"];

const STEP_SUBTITLE: Record<CreateStep, string> = {
  image: "Select an Image",
  resources: "Configure resources",
  confirm: "Confirm and launch",
};

export default function CreateSandboxView({
  workspaceSlug,
}: CreateSandboxViewProps) {
  const searchParams = useSearchParams();
  const path = searchParams.get("path");
  if (path === "sdk") {
    return <SdkGuide listHref={`/${workspaceSlug}/sandboxes`} />;
  }
  return <CreateFlow workspaceSlug={workspaceSlug} />;
}

function CreateFlow({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = readStepParam(searchParams.get("step"));
  const listHref = `/${workspaceSlug}/sandboxes`;
  const sdkHref = `/${workspaceSlug}/sandboxes/new?path=sdk`;

  const { accountId, workspaceId } = useCurrentTenancy();
  const imagesQuery = useQuery(sandboxQueries.images(accountId, workspaceId));
  const volumesQuery = useQuery(volumeQueries.list(accountId, workspaceId));

  const [formState, setFormState] = useState<CreateFormState>(INITIAL_STATE);
  const [memoryEdited, setMemoryEdited] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Apply Image-driven defaults once the user picks an Image, but never
  // stomp a memory the user has set themselves.
  useEffect(() => {
    if (!formState.imageRef) return;
    const image = findSandboxImage(formState.imageRef);
    setFormState((prev) =>
      applyImageDefaults(prev, image, memoryEdited),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.imageRef]);

  const isDirty = useMemo(() => {
    return (
      formState.imageRef !== INITIAL_STATE.imageRef ||
      formState.memoryMib !== INITIAL_STATE.memoryMib ||
      formState.ttl !== INITIAL_STATE.ttl ||
      formState.region !== INITIAL_STATE.region ||
      formState.volumes.length > 0 ||
      formState.envVars.length > 0 ||
      formState.displayName !== "" ||
      formState.sandboxName !== ""
    );
  }, [formState]);

  function goToStep(next: CreateStep) {
    const url = `/${workspaceSlug}/sandboxes/new?step=${next}`;
    router.push(url);
  }

  function onChangeForm(next: CreateFormState) {
    if (next.memoryMib !== formState.memoryMib) setMemoryEdited(true);
    setFormState(next);
    if (next.sandboxName !== formState.sandboxName) setNameError(null);
  }

  function handleCancel() {
    if (step === "image" && !isDirty) {
      router.push(listHref);
      return;
    }
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    router.push(listHref);
  }

  async function handleCreate() {
    if (!isValidSandboxName(formState.sandboxName)) {
      setNameError(
        "Lowercase letters, numbers, and hyphens only. Max 49 characters.",
      );
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    toast.success(`Sandbox "${formState.sandboxName}" created`);
    router.push(listHref);
  }

  const summary = useMemo(() => <SummaryRail state={formState} />, [formState]);

  const continueDisabled =
    step === "image" ? formState.imageRef === null : false;

  const stepIndex = STEP_ORDER.indexOf(step) + 1;

  return (
    <div className="page-shell">
      <header className="flex flex-col gap-3">
        <Breadcrumb
          parent={{ href: listHref, label: "Sandboxes" }}
          current="Create Sandbox"
        />
        <div className="flex items-baseline justify-between gap-4">
          <div className="page-header">
            <h1 className="typography-display font-semibold text-foreground">
              Create Sandbox
            </h1>
            <p className="typography-body text-muted-foreground">
              {STEP_SUBTITLE[step]}
            </p>
          </div>
          <span className="typography-caption text-meta-foreground">
            Step {stepIndex} of {STEP_ORDER.length}
          </span>
        </div>
      </header>

      <div
        className={
          step === "image"
            ? "flex min-h-0 flex-1 flex-col gap-6"
            : "grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"
        }
      >
        <div className="flex flex-col gap-6">
          {step === "image" ? (
            <ImageStepBody
              isPending={imagesQuery.isPending}
              isError={imagesQuery.isError}
              images={imagesQuery.data}
              onRetry={() => imagesQuery.refetch()}
              selectedRef={formState.imageRef}
              onSelect={(ref) =>
                setFormState((prev) => ({ ...prev, imageRef: ref }))
              }
              sdkHref={sdkHref}
            />
          ) : null}

          {step === "resources" ? (
            <StepResources
              state={formState}
              onChange={onChangeForm}
              workspaceVolumes={volumesQuery.data ?? []}
              onEditImage={() => goToStep("image")}
            />
          ) : null}

          {step === "confirm" ? (
            <StepConfirm
              state={formState}
              onChange={onChangeForm}
              onEditImage={() => goToStep("image")}
              onEditResources={() => goToStep("resources")}
              nameError={nameError}
            />
          ) : null}
        </div>

        {step !== "image" ? <div className="lg:sticky lg:top-6">{summary}</div> : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-6 shrink-0">
        {step !== "image" ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (step === "resources") goToStep("image");
              if (step === "confirm") goToStep("resources");
            }}
          >
            <ArrowLeft aria-hidden="true" />
            Prev
          </Button>
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          {step === "image" ? (
            <Button
              type="button"
              variant="primary"
              disabled={continueDisabled}
              onClick={() => goToStep("resources")}
            >
              Continue
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : null}
          {step === "resources" ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => goToStep("confirm")}
            >
              Next
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : null}
          {step === "confirm" ? (
            <Button
              type="button"
              variant="primary"
              disabled={submitting || formState.sandboxName === ""}
              onClick={handleCreate}
            >
              {submitting ? "Creating…" : "Create Sandbox"}
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog
        open={confirmDiscard}
        onOpenChange={(next) => {
          if (!next) setConfirmDiscard(false);
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="typography-body text-foreground">
              The Sandbox you were setting up has not been created. Leaving
              now drops your selections.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDiscard(false)}
            >
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmDiscard(false);
                router.push(listHref);
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ImageStepBodyProps {
  isPending: boolean;
  isError: boolean;
  images: ReadonlyArray<SandboxImage> | undefined;
  onRetry: () => void;
  selectedRef: string | null;
  onSelect: (ref: string) => void;
  sdkHref: string;
}

function ImageStepBody({
  isPending,
  isError,
  images,
  onRetry,
  selectedRef,
  onSelect,
  sdkHref,
}: ImageStepBodyProps) {
  if (isPending) {
    return (
      <p className="typography-caption text-muted-foreground">
        Loading Images…
      </p>
    );
  }
  if (isError) {
    return (
      <p className="typography-body text-state-errored-text">
        Failed to load Images.{" "}
        <button
          type="button"
          onClick={onRetry}
          className="font-medium text-primary hover:underline"
        >
          Retry
        </button>
      </p>
    );
  }
  return (
    <StepImage
      images={images ?? []}
      selectedRef={selectedRef}
      onSelect={onSelect}
      sdkHref={sdkHref}
    />
  );
}
