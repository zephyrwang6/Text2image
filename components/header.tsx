"use client"

import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/hooks/use-language"

export default function Header() {
  const { t } = useLanguage()

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Image 
            src="/images/logo1.png" 
            alt="Logo" 
            width={32} 
            height={32}
            className="rounded-sm"
          />
          <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            文图图
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="https://v3oxu28gnc.feishu.cn/wiki/S2uWwmt5siVUp7kUycMc7f3JnC6?fromScene=spaceOverview" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("documentation")}
            </Link>
            <Link href="https://chromewebstore.google.com/detail/%E6%96%87%E5%9B%BE%E5%9B%BE/ghomaakdemboehnholpnmglfandmlefg" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("downloadPlugin")}
            </Link>
            <Link href="https://jike.city/pmplanet" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("about")}
            </Link>
          </nav>
          <LanguageToggle />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
