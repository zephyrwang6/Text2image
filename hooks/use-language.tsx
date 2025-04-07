"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations } from "@/lib/translations"

type Language = "zh" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// Create a default value for the context to avoid the "must be used within a Provider" error
const defaultLanguageContext: LanguageContextType = {
  language: "zh",
  setLanguage: () => {},
  t: (key) => key,
}

const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh")

  // Load language preference from localStorage on client side
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("language") as Language
      if (savedLanguage && (savedLanguage === "zh" || savedLanguage === "en")) {
        setLanguage(savedLanguage)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  // Save language preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("language", language)
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }, [language])

  // Translation function
  const t = (key: string): string => {
    if (!translations[language] || !translations[language][key]) {
      return key
    }
    return translations[language][key]
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  return context
}

