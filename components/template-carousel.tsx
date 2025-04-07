"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"
import { getTemplatesByType } from "@/lib/templates"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TemplateCarouselProps {
  type: "cover" | "card" | "diagram"
  selectedTemplate: string
  onSelectTemplate: (templateId: string, templateName: string) => void
}

export default function TemplateCarousel({ type, selectedTemplate, onSelectTemplate }: TemplateCarouselProps) {
  const { language, t } = useLanguage()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  // 获取当前类型的模板
  const templates = getTemplatesByType(type)

  // 检查滚动按钮的可见性
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftButton(scrollLeft > 0)
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
  }

  // 初始化和窗口大小变化时检查滚动按钮
  useEffect(() => {
    checkScrollButtons()
    window.addEventListener("resize", checkScrollButtons)
    return () => window.removeEventListener("resize", checkScrollButtons)
  }, [])

  // 滚动处理
  const handleScroll = () => {
    checkScrollButtons()
  }

  // 滚动到左侧
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
  }

  // 滚动到右侧
  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
  }

  // 当选中的模板ID变化时，滚动到该模板
  useEffect(() => {
    if (!scrollContainerRef.current || !selectedTemplate) return

    const selectedTemplateElement = scrollContainerRef.current.querySelector(`[data-template-id="${selectedTemplate}"]`)
    if (selectedTemplateElement) {
      selectedTemplateElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [selectedTemplate])

  return (
    <div className="relative max-w-2xl mx-auto">
      {showLeftButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full shadow-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide" onScroll={handleScroll}>
        {templates.map((template) => {
          const displayName = language === "zh" ? template.name : template.nameEn
          const description = language === "zh" ? template.description : template.descriptionEn
          const imagePath = `/images/${template.id}.png`

          return (
            <div key={template.id} className="flex-shrink-0 w-[220px]" data-template-id={template.id}>
              <Card
                className={cn(
                  "aspect-[3/4] w-full cursor-pointer transition-all hover:shadow-md overflow-hidden rounded-xl",
                  selectedTemplate === template.id && "ring-2 ring-primary",
                )}
                onClick={() => onSelectTemplate(template.id, displayName)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={imagePath || "/placeholder.svg"}
                    alt={displayName}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // 如果图片加载失败，使用颜色背景
                      e.currentTarget.style.display = "none"
                      e.currentTarget.parentElement!.className =
                        `${e.currentTarget.parentElement!.className} ${template.color}`
                    }}
                  />
                </div>
              </Card>

              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm font-medium">{displayName}</div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full"
                  onClick={() => onSelectTemplate(template.id, displayName)}
                >
                  {t("use")}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {showRightButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full shadow-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

