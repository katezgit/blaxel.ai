import type { Meta, StoryObj } from "@storybook/react"
import { ShieldIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"

const meta: Meta<typeof SelectTrigger> = {
  title: "Components/Select",
  component: SelectTrigger,
  argTypes: {
    size: {
      control: "select",
      options: ["md", "sm"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    size: "md",
    disabled: false,
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 240 }}>
      <Select>
        <SelectTrigger {...args}>
          <SelectValue placeholder="Select environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prod">sandbox-prod</SelectItem>
          <SelectItem value="staging">sandbox-staging</SelectItem>
          <SelectItem value="dev">sandbox-dev</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

// ── Variants — sizes ─────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 240 }}>
      <div className="flex flex-col gap-1.5">
        <span className="typography-caption text-muted-foreground">md (32px)</span>
        <Select>
          <SelectTrigger size="md">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sonnet">claude-3-5-sonnet</SelectItem>
            <SelectItem value="haiku">claude-3-haiku</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="typography-caption text-muted-foreground">sm (28px)</span>
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sonnet">claude-3-5-sonnet</SelectItem>
            <SelectItem value="haiku">claude-3-haiku</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

// ── Feature: WithValue ───────────────────────────────────────────────────────
// Committed selection — foreground text instead of placeholder color.

export const WithValue: Story = {
  name: "With value",
  render: () => (
    <div style={{ width: 240 }}>
      <Select defaultValue="sonnet">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sonnet">claude-3-5-sonnet</SelectItem>
          <SelectItem value="haiku">claude-3-haiku</SelectItem>
          <SelectItem value="gpt4o">gpt-4o</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

// ── Feature: Disabled ────────────────────────────────────────────────────────
// Sunken muted surface, chevron dimmed, pointer-events none.

export const Disabled: Story = {
  name: "Disabled",
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 240 }}>
      <Select disabled>
        <SelectTrigger disabled>
          <SelectValue placeholder="Select environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prod">sandbox-prod</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="prod" disabled>
        <SelectTrigger disabled>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prod">sandbox-prod</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

// ── Feature: WithGroupsAndSeparator ─────────────────────────────────────────
// Grouped items with SelectLabel and SelectSeparator.

export const WithGroupsAndSeparator: Story = {
  name: "With groups and separator",
  render: () => (
    <div style={{ width: 240 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Anthropic</SelectLabel>
            <SelectItem value="claude-sonnet">claude-3-5-sonnet</SelectItem>
            <SelectItem value="claude-haiku">claude-3-haiku</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>OpenAI</SelectLabel>
            <SelectItem value="gpt-4o">gpt-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Google</SelectLabel>
            <SelectItem value="gemini-pro">gemini-1.5-pro</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

// ── Feature: WithDisabledItems ───────────────────────────────────────────────
// Some items disabled — renders with --text-disabled, no hover response.

export const WithDisabledItems: Story = {
  name: "With disabled items",
  render: () => (
    <div style={{ width: 240 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="enterprise" disabled>Enterprise (contact sales)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

// ── Feature: WithRenderItem ───────────────────────────────────────────────────
// Custom dropdown row via renderItem prop.
// children still appear in the trigger (via ItemText); renderItem controls the dropdown row.
// Demonstrates mixed usage: some items with renderItem, some default.

export const WithRenderItem: Story = {
  name: "With renderItem (custom row content)",
  render: () => (
    <div className="flex flex-col gap-6" style={{ width: 320 }}>
      {/* Role picker — icon + title + description rows */}
      <div className="flex flex-col gap-1.5">
        <span className="typography-caption text-muted-foreground">
          Trigger shows title only; dropdown row is fully custom via renderItem
        </span>
        <Select defaultValue="member">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="owner"
              renderItem={() => (
                <div className="flex items-start gap-2">
                  <ShieldIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <span>Owner</span>
                    <span className="typography-caption text-muted-foreground">
                      Full control over the workspace, billing, and members.
                    </span>
                  </div>
                </div>
              )}
            >
              Owner
            </SelectItem>
            <SelectItem
              value="admin"
              renderItem={() => (
                <div className="flex items-start gap-2">
                  <ShieldIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <span>Admin</span>
                    <span className="typography-caption text-muted-foreground">
                      Can manage resources and invite members, but not billing.
                    </span>
                  </div>
                </div>
              )}
            >
              Admin
            </SelectItem>
            <SelectItem
              value="member"
              renderItem={() => (
                <div className="flex items-start gap-2">
                  <ShieldIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <span>Member</span>
                    <span className="typography-caption text-muted-foreground">
                      Read and deploy access. Cannot manage members or settings.
                    </span>
                  </div>
                </div>
              )}
            >
              Member
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mixed: some items with renderItem, some default single-line */}
      <div className="flex flex-col gap-1.5">
        <span className="typography-caption text-muted-foreground">
          Mixed — renderItem items and default single-line items together
        </span>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="prod"
              renderItem={() => (
                <div className="flex flex-col gap-0.5">
                  <span>Production</span>
                  <span className="typography-caption text-muted-foreground">
                    Live traffic. Requires approval to deploy.
                  </span>
                </div>
              )}
            >
              Production
            </SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="dev">Development</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}
