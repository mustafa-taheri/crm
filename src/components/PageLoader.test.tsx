import { render, screen, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { PageLoader } from "./PageLoader"

describe("PageLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllTimers()
  })

  it("shows the loader on navigation and hides children while loading", () => {
    render(
      <PageLoader>
        <span data-testid="content">Page content</span>
      </PageLoader>
    )

    expect(screen.queryByTestId("content")).not.toBeInTheDocument()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it("auto-hides the loader after the timeout without user interaction", () => {
    render(
      <PageLoader>
        <span data-testid="content">Page content</span>
      </PageLoader>
    )

    expect(screen.queryByTestId("content")).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByTestId("content")).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it("hides the loader immediately on user interaction", () => {
    render(
      <PageLoader>
        <span data-testid="content">Page content</span>
      </PageLoader>
    )

    act(() => {
      window.dispatchEvent(new MouseEvent("click"))
    })

    expect(screen.getByTestId("content")).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
})
