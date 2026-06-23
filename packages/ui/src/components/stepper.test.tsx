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

  // Completed steps render a check icon (no step numeral).
  // Active and pending steps render a numeral.

  it("renders no step numeral for steps before currentStep (completed)", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [alpha] = getStepItems()
    expect(within(alpha!).queryByText("1")).toBeNull()
  })

  it("renders a numeral for the active step", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, beta] = getStepItems()
    expect(within(beta!).getByText("2")).toBeInTheDocument()
  })

  it("renders a numeral for steps after currentStep (pending)", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, , gamma] = getStepItems()
    expect(within(gamma!).getByText("3")).toBeInTheDocument()
  })

  it("marks first step active and all others pending when currentStep=1", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={1} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(alpha).toHaveAttribute("aria-current", "step")
    expect(beta).not.toHaveAttribute("aria-current")
    expect(gamma).not.toHaveAttribute("aria-current")
    // No completed steps → all numerals present
    expect(within(alpha!).getByText("1")).toBeInTheDocument()
    expect(within(beta!).getByText("2")).toBeInTheDocument()
    expect(within(gamma!).getByText("3")).toBeInTheDocument()
  })

  it("marks last step active and all prior steps completed when currentStep=steps.length", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={3} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(gamma).toHaveAttribute("aria-current", "step")
    // Steps 1 and 2 are completed → no numerals
    expect(within(alpha!).queryByText("1")).toBeNull()
    expect(within(beta!).queryByText("2")).toBeNull()
    // Last step is active → numeral present
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
    expect(within(beta!).queryByText(/desc/i)).toBeNull()
  })

  it("renders all steps as pending with no active step when currentStep=0", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={0} />)
    const items = getStepItems()
    items.forEach((item) => {
      expect(item).not.toHaveAttribute("aria-current")
    })
    // All steps show numerals (no completed state)
    expect(within(items[0]!).getByText("1")).toBeInTheDocument()
    expect(within(items[1]!).getByText("2")).toBeInTheDocument()
    expect(within(items[2]!).getByText("3")).toBeInTheDocument()
  })

  it("renders all steps as completed with no active step when currentStep exceeds steps.length", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={4} />)
    const items = getStepItems()
    items.forEach((item) => {
      expect(item).not.toHaveAttribute("aria-current")
    })
    // All completed → no numerals
    expect(within(items[0]!).queryByText("1")).toBeNull()
    expect(within(items[1]!).queryByText("2")).toBeNull()
    expect(within(items[2]!).queryByText("3")).toBeNull()
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
