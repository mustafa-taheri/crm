"use client"

import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

