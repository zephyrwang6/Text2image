"use client"

import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} 文 To 图. {t("allRightsReserved")}
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              {t("termsOfService")}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              {t("contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

