import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import AppLayout from "./AppLayout"

// Mock the useUser hook
vi.mock("@/lib/hooks/useUser", () => ({
  useUser: () => ({
    user: { id: "1", email: "test@tohfawala.com" },
    profile: { id: "1", user_id: "1", full_name: "Test User", role: "admin" },
    role: "admin",
    loading: false,
  }),
}))

describe("AppLayout", () => {
  it("renders children content", () => {
    render(
      <AppLayout>
        <div data-testid="content">Page content here</div>
      </AppLayout>
    )
    expect(screen.getByTestId("content")).toHaveTextContent("Page content here")
  })

  it("renders navigation links", () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Customers")).toBeInTheDocument()
    expect(screen.getByText("WhatsApp")).toBeInTheDocument()
    expect(screen.getByText("Follow-ups")).toBeInTheDocument()
    expect(screen.getByText("Reports")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("renders user name in header", () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )
    expect(screen.getByText("Test User")).toBeInTheDocument()
  })

  it("shows sign out button", () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument()
  })
})
