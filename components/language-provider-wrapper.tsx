"use client"

import type { ReactNode } from "react"
import { LanguageProvider } from "@/hooks/use-language"

export function LanguageProviderWrapper({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

