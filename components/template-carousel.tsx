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

      <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 pb-4 pt-2 px-2 scrollbar-hide" onScroll={handleScroll}>
        {templates.map((template) => {
          const displayName = language === "zh" ? template.name : template.nameEn
          const description = language === "zh" ? template.description : template.descriptionEn
          
          // 根据模板ID或名称获取对应的图片路径
          let imagePath = ""
          switch(template.id) {
            case "cyber-tech":
              imagePath = "/images/赛博科技风.png"
              break
            case "xiaohongshu-cover":
              imagePath = "/images/小红书封面.png"
              break
            case "pixel-art":
              imagePath = "/images/极简主义风格.png"
              break
            case "geometric-constructivism":
              imagePath = "/images/几何卡片.png"
              break
            case "british-rock":
              imagePath = "/images/英伦摇滚风格.png"
              break
            case "bold-modern":
              imagePath = "/images/大胆现代.png"
              break
            case "elegant-vintage":
              imagePath = "/images/优雅复古.png"
              break
            case "elegant-text-card":
              imagePath = "/images/文雅文字.png"
              break
            case "concept-card":
              imagePath = "/images/复古卡片.png"
              break
            case "black-white-logic":
              imagePath = "/images/黑白逻辑图.png"
              break
            case "gradient-logic":
              imagePath = "/images/彩色渐变.png"
              break
            default:
              imagePath = `/images/${template.id}.png` // 默认尝试使用ID
          }

          return (
            <div key={template.id} className="flex-shrink-0 w-[220px] p-1" data-template-id={template.id}>
              <Card
                className={cn(
                  "aspect-[3/4] w-full cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden rounded-xl relative",
                  selectedTemplate === template.id 
                    ? "ring-2 ring-primary ring-opacity-90 shadow-lg transform scale-[1.02]" 
                    : "hover:scale-[1.01]"
                )}
                onClick={() => onSelectTemplate(template.id, displayName)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={imagePath}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 220px"
                    onError={(e) => {
                      // 如果图片加载失败，使用颜色背景
                      e.currentTarget.style.display = "none"
                      e.currentTarget.parentElement!.className =
                        `${e.currentTarget.parentElement!.className} ${template.color}`
                    }}
                  />
                </div>
              </Card>

              <div className="mt-3">
                <div className="text-sm font-medium">{displayName}</div>
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
