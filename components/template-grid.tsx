"use client"

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

        return (
          <div key={template.id} className="flex flex-col items-center gap-2">
            <Card
              className={cn(
                "aspect-[3/4] w-full cursor-pointer transition-all hover:shadow-md",
                template.color,
                selectedTemplate === template.id && "ring-2 ring-primary",
              )}
              onClick={() => onSelectTemplate(template.id, displayName)}
            />
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

