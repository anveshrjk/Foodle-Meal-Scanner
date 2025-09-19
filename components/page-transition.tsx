"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 150)
    return () => clearTimeout(timer)
  }, [pathname])

  return <div className={`transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}>{children}</div>
}
