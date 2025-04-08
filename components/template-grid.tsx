"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"
import { getTemplatesByType } from "@/lib/templates"

interface TemplateGridProps {
  type: "cover" | "card" | "diagram"
  selectedTemplate: string
  onSelectTemplate: (templateId: string, templateName: string) => void
}

export default function TemplateGrid({ type, selectedTemplate, onSelectTemplate }: TemplateGridProps) {
  const { language, t } = useLanguage()

  // Get templates for the current type
  const templates = getTemplatesByType(type)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          <div key={template.id} className="flex flex-col items-center gap-2">
            <Card
              className={cn(
                "aspect-[3/4] w-full cursor-pointer transition-all hover:shadow-md overflow-hidden",
                selectedTemplate === template.id && "ring-2 ring-primary",
              )}
              onClick={() => onSelectTemplate(template.id, displayName)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={imagePath}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  onError={(e) => {
                    // 如果图片加载失败，使用颜色背景
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement!.className =
                      `${e.currentTarget.parentElement!.className} ${template.color}`
                  }}
                />
              </div>
            </Card>
            <div className="text-sm font-medium">{displayName}</div>
            <p className="text-xs text-muted-foreground text-center px-2">{description}</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => onSelectTemplate(template.id, displayName)}
            >
              {t("use")}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

