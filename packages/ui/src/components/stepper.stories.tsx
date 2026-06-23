import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { Stepper } from "./stepper"

const FOUR_STEPS = [
  { label: "Model",   description: "Choose the model checkpoint to train." },
  { label: "Taskset", description: "Select the taskset to train against." },
  { label: "Tasks",   description: "Pick which tasks to include." },
  { label: "Review",  description: "Confirm configuration and launch." },
] as const

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: { layout: "padded" },
  argTypes: {
    currentStep: { control: { type: "number", min: 1 } },
    onStepClick: { action: "stepClick" },
    "aria-label": { control: "text" },
  },
  args: {
    steps: [...FOUR_STEPS],
    currentStep: 2,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* ─── Playground ─────────────────────────────────────────────────────────────
   currentStep=2 renders completed (step 1), active (step 2), and pending
   (steps 3–4) simultaneously. Adjust currentStep control to reach boundary
   states: 1 = no completed steps, 4 = all completed.                        */

export const Playground: Story = {}

/* ─── WithoutDescriptions ────────────────────────────────────────────────────
   Steps without a description prop — description row is omitted, collapsing
   the layout to a single indicator row.                                      */

export const WithoutDescriptions: Story = {
  args: {
    steps: [
      { label: "Model" },
      { label: "Taskset" },
      { label: "Tasks" },
      { label: "Review" },
    ],
    currentStep: 2,
  },
}

/* ─── WithBackwardNav ─────────────────────────────────────────────────────────
   Steps 1–2 are completed and clickable; click either to see onStepClick fire
   in the Actions panel. Active step (Tasks) and pending step (Review) produce
   no callback.                                                                */

export const WithBackwardNav: Story = {
  args: {
    currentStep: 3,
    onStepClick: fn(),
  },
}

/* ─── MobileView ──────────────────────────────────────────────────────────────
   Spec §4: on narrow viewports the full step row collapses to a single-step
   summary — "Step N of M" counter, current label, and current description.
   The desktop list is hidden at this width.                                  */

export const MobileView: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    layout: "padded",
  },
}
