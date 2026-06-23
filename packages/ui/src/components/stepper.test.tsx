import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { Stepper } from "./stepper"

// Helper: grab each <li> from the desktop <ol role="list">.
// The mobile <div role="group"> shares the aria-label but has role="group",
// so getByRole("list") unambiguously targets the <ol>.
function getStepItems() {
  const list = screen.getByRole("list")
  return within(list).getAllByRole("listitem")
}

const THREE_STEPS = [
  { label: "Alpha" },
  { label: "Beta" },
  { label: "Gamma" },
]

describe("Stepper", () => {
  it("renders all step labels", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(within(alpha!).getByText("Alpha")).toBeInTheDocument()
    expect(within(beta!).getByText("Beta")).toBeInTheDocument()
    expect(within(gamma!).getByText("Gamma")).toBeInTheDocument()
  })

  it("marks the current step's listitem with aria-current=step", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, beta] = getStepItems()
    expect(beta).toHaveAttribute("aria-current", "step")
  })

  it("does not mark non-current steps with aria-current", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [alpha, , gamma] = getStepItems()
    expect(alpha).not.toHaveAttribute("aria-current")
    expect(gamma).not.toHaveAttribute("aria-current")
  })

  // Completed steps render a <Check> SVG icon (no numeral).
  // Pending and active steps render a numeral (no SVG inside the circle).

  it("renders a check icon (no step numeral) for steps before currentStep", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [alpha] = getStepItems()
    // Step 1 (idx 0) is completed: circle has SVG, not the numeral "1"
    expect(alpha!.querySelector("svg")).not.toBeNull()
    expect(within(alpha!).queryByText("1")).toBeNull()
  })

  it("renders a numeral for the active step", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, beta] = getStepItems()
    // Step 2 (idx 1) is active: numeral "2" present
    expect(within(beta!).getByText("2")).toBeInTheDocument()
  })

  it("renders a numeral for steps after currentStep (pending)", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, , gamma] = getStepItems()
    // Step 3 (idx 2) is pending: numeral "3" present, no check SVG
    expect(within(gamma!).getByText("3")).toBeInTheDocument()
    expect(gamma!.querySelector("svg")).toBeNull()
  })

  it("marks first step active and all others pending when currentStep=1", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={1} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(alpha).toHaveAttribute("aria-current", "step")
    expect(beta).not.toHaveAttribute("aria-current")
    expect(gamma).not.toHaveAttribute("aria-current")
    // No completed steps → no SVG icons
    expect(alpha!.querySelector("svg")).toBeNull()
    expect(beta!.querySelector("svg")).toBeNull()
    expect(gamma!.querySelector("svg")).toBeNull()
  })

  it("marks last step active and all prior steps completed when currentStep=steps.length", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={3} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(gamma).toHaveAttribute("aria-current", "step")
    // Steps 1 and 2 are completed → check icons
    expect(alpha!.querySelector("svg")).not.toBeNull()
    expect(beta!.querySelector("svg")).not.toBeNull()
    // Last step is active → numeral, no check icon
    expect(gamma!.querySelector("svg")).toBeNull()
    expect(within(gamma!).getByText("3")).toBeInTheDocument()
  })

  it("renders the description when provided", () => {
    render(
      <Stepper
        steps={[{ label: "Alpha", description: "Alpha desc" }, { label: "Beta" }]}
        currentStep={1}
      />,
    )
    // Scope to the desktop list to avoid the mobile summary section
    const list = screen.getByRole("list")
    expect(within(list).getByText("Alpha desc")).toBeInTheDocument()
  })

  it("does not render a description element when description is omitted", () => {
    render(
      <Stepper
        steps={[{ label: "Alpha", description: "Alpha desc" }, { label: "Beta" }]}
        currentStep={1}
      />,
    )
    const [, beta] = getStepItems()
    // Beta step has no description
    expect(within(beta!).queryByText(/desc/i)).toBeNull()
  })

  it("merges custom className onto the root element", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={1} className="custom-stepper" />)
    // Root is the wrapping <div>; locate it as the closest ancestor of the list
    const list = screen.getByRole("list")
    expect(list.closest("div.custom-stepper")).not.toBeNull()
  })

  // Source: activeIndex = 0 - 1 = -1. isActive never true; isCompleted (idx < -1)
  // never true → all steps are pending, none active.

  it("renders all steps as pending with no active step when currentStep=0", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={0} />)
    const items = getStepItems()
    items.forEach((item) => {
      expect(item).not.toHaveAttribute("aria-current")
      expect(item.querySelector("svg")).toBeNull()
    })
  })

  // Source: activeIndex = steps.length (e.g. 3 for a 3-step array).
  // isActive (idx === 3) never true; isCompleted (idx < 3) true for all → all completed.

  it("renders all steps as completed with no active step when currentStep exceeds steps.length", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={4} />)
    const items = getStepItems()
    items.forEach((item) => {
      expect(item).not.toHaveAttribute("aria-current")
      expect(item.querySelector("svg")).not.toBeNull()
    })
  })

  describe("onStepClick", () => {
    it("renders completed step rows as buttons when onStepClick is provided", () => {
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={3} onStepClick={handler} />)
      const [alpha, beta] = getStepItems()
      // Steps 1 and 2 are completed → should contain a <button>
      expect(within(alpha!).getByRole("button")).toBeInTheDocument()
      expect(within(beta!).getByRole("button")).toBeInTheDocument()
    })

    it("does not render active step as a button when onStepClick is provided", () => {
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={3} onStepClick={handler} />)
      const [, , gamma] = getStepItems()
      // Step 3 is active → no button
      expect(within(gamma!).queryByRole("button")).toBeNull()
    })

    it("does not render pending step as a button when onStepClick is provided", () => {
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={2} onStepClick={handler} />)
      const [, , gamma] = getStepItems()
      // Step 3 is pending → no button
      expect(within(gamma!).queryByRole("button")).toBeNull()
    })

    it("calls onStepClick with the correct 1-indexed step number for each completed step", async () => {
      const user = userEvent.setup()
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={3} onStepClick={handler} />)
      const [alpha, beta] = getStepItems()
      await user.click(within(alpha!).getByRole("button", { name: /Go back to step 1: Alpha/i }))
      expect(handler).toHaveBeenCalledWith(1)
      await user.click(within(beta!).getByRole("button", { name: /Go back to step 2: Beta/i }))
      expect(handler).toHaveBeenCalledWith(2)
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it("activates onStepClick via Enter on a completed step", async () => {
      const user = userEvent.setup()
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={3} onStepClick={handler} />)
      const [alpha] = getStepItems()
      within(alpha!).getByRole("button", { name: /Go back to step 1: Alpha/i }).focus()
      await user.keyboard("{Enter}")
      expect(handler).toHaveBeenCalledWith(1)
    })

    it("activates onStepClick via Space on a completed step", async () => {
      const user = userEvent.setup()
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={3} onStepClick={handler} />)
      const [alpha] = getStepItems()
      within(alpha!).getByRole("button", { name: /Go back to step 1: Alpha/i }).focus()
      await user.keyboard(" ")
      expect(handler).toHaveBeenCalledWith(1)
    })

    it("exposes the accessible name on completed step buttons", () => {
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={3} onStepClick={handler} />)
      expect(screen.getByRole("button", { name: /Go back to step 1: Alpha/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Go back to step 2: Beta/i })).toBeInTheDocument()
    })

    it("does not render any buttons when onStepClick is omitted (presentational mode)", () => {
      render(<Stepper steps={THREE_STEPS} currentStep={2} />)
      const list = screen.getByRole("list")
      expect(within(list).queryAllByRole("button")).toHaveLength(0)
    })

    // The mobile section is a <div role="group"> showing only the active step
    // summary. It renders no buttons regardless of onStepClick.

    it("renders no buttons inside the mobile summary section even when onStepClick is provided", () => {
      const handler = jest.fn()
      render(<Stepper steps={THREE_STEPS} currentStep={2} onStepClick={handler} />)
      const mobileGroup = screen.getByRole("group", { name: "Wizard progress" })
      expect(within(mobileGroup).queryAllByRole("button")).toHaveLength(0)
    })
  })
})
