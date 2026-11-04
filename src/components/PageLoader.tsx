"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function PageLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [fromNavigation, setFromNavigation] = useState(false);
  const timeoutId = React.useRef<number | undefined>(undefined);

  useEffect(() => {
    // Called when navigation is detected (new page mount/redirect)
    // Set loading state immediately
    setFromNavigation(true);
    setIsLoading(true);

    // Clear any existing timer from previous navigation
    if (timeoutId.current !== undefined) {
      clearTimeout(timeoutId.current);
    }

    // Auto-hide loader after 1 second if user hasn't interacted
    timeoutId.current = window.setTimeout(() => {
      setIsLoading(false);
      setFromNavigation(false);
    }, 1000);

    // User interaction (click/keypress) cancels auto-hide and hides loader immediately
    const handleInteraction = () => {
      clearTimeout(timeoutId.current!);
      timeoutId.current = undefined;
      setIsLoading(false);
      setFromNavigation(false);
      // Remove listeners after interaction
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    // Cleanup on unmount or navigation
    return () => {
      if (timeoutId.current !== undefined) {
        clearTimeout(timeoutId.current!);
        timeoutId.current = undefined;
      }
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [pathname]);

  // Render children when no loading state
  if (!isLoading && !fromNavigation) {
    return children;
  }

  return (
    <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl p-8 shadow-2xl border border-border max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <Loader2 className="h-12 w-12 text-primary animate-spin mr-3" />
          <span className="text-lg font-medium text-foreground">
            Loading...
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Preparing {fromNavigation ? "your page" : "data"}...
        </p>
      </div>
    </div>
  );
}
