import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { useState } from "react"
import { Calendar } from "./calendar"
import type { DateRange } from "./calendar"

const TODAY = new Date(2026, 5, 19)

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function SingleDemo() {
  const [selected, setSelected] = useState<Date | undefined>(TODAY)
  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={setSelected}
      defaultMonth={TODAY}
    />
  )
}

function RangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 5, 15),
    to: new Date(2026, 5, 19),
  })
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      defaultMonth={TODAY}
    />
  )
}

function MultipleDemo() {
  const [days, setDays] = useState<Date[] | undefined>([
    new Date(2026, 5, 10),
    new Date(2026, 5, 15),
    new Date(2026, 5, 19),
  ])
  return (
    <Calendar
      mode="multiple"
      selected={days}
      onSelect={setDays}
      defaultMonth={TODAY}
    />
  )
}

function TwoMonthsDemo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 5, 25),
    to: new Date(2026, 6, 5),
  })
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      defaultMonth={new Date(2026, 5, 1)}
      numberOfMonths={2}
    />
  )
}

export const SingleSelection: Story = {
  render: () => <SingleDemo />,
}

export const RangeSelection: Story = {
  render: () => <RangeDemo />,
}

export const RangeMidDraw: Story = {
  render: () => (
    <Calendar
      mode="range"
      selected={{ from: new Date(2026, 5, 15), to: undefined }}
      onSelect={() => {}}
      defaultMonth={TODAY}
    />
  ),
}

export const MultipleSelection: Story = {
  render: () => <MultipleDemo />,
}

export const TwoMonths: Story = {
  render: () => <TwoMonthsDemo />,
}

export const NoSelection: Story = {
  render: () => (
    <Calendar
      mode="single"
      selected={undefined}
      onSelect={() => {}}
      defaultMonth={TODAY}
    />
  ),
}
