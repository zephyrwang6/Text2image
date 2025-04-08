"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RefreshCw, ChevronDown, ArrowRight, Code } from "lucide-react"
import TemplateCarousel from "@/components/template-carousel"
import RecentGenerations from "@/components/recent-generations"
import { useLanguage } from "@/hooks/use-language"
import { getTemplateById, getTemplatesByType } from "@/lib/templates"
import { generateAIContent } from "@/lib/api"
import { storeContent, generateUniqueId, getRecentContent } from "@/lib/storage"

interface TextToImageConverterProps {
  type: "cover" | "card" | "diagram"
  selectedTemplate?: string
}

export default function TextToImageConverter({ type, selectedTemplate }: TextToImageConverterProps) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [selectedTemplateName, setSelectedTemplateName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [tokenCount, setTokenCount] = useState<number | null>(null)
  const { language, t } = useLanguage()

  // 加载最近生成的内容
  useEffect(() => {
    const recent = getRecentContent(8)
    setRecentGenerations(recent)
  }, [])

  // 设置默认模板
  useEffect(() => {
    const templates = getTemplatesByType(type)
    if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id)
      setSelectedTemplateName(language === "zh" ? templates[0].name : templates[0].nameEn)
    }
  }, [type, language])

  // 当从父组件传入selectedTemplate时更新
  useEffect(() => {
    if (selectedTemplate) {
      const template = getTemplateById(selectedTemplate)
      if (template) {
        setSelectedTemplateId(selectedTemplate)
        setSelectedTemplateName(language === "zh" ? template.name : template.nameEn)
      }
    }
  }, [selectedTemplate, language])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleTemplateSelect = (templateId: string, templateName: string) => {
    setSelectedTemplateId(templateId)
    setSelectedTemplateName(templateName)
  }

  const generateContent = async () => {
    if (!text.trim() || !selectedTemplateId) return

    setIsGenerating(true)
    setError(null)
    setTokenCount(null)

    try {
      // 获取选中的模板
      const template = getTemplateById(selectedTemplateId)

      if (!template) {
        throw new Error("Template not found")
      }

      // 调用AI内容生成API
      const response = await generateAIContent({
        text,
        templateId: selectedTemplateId,
        type,
        language,
      })

      if (!response.success || !response.content) {
        throw new Error(response.error || "Failed to generate content")
      }

      // 设置token计数
      if (response.tokenUsage) {
        setTokenCount(response.tokenUsage.totalTokens)
      }

      // 生成唯一ID
      const contentId = generateUniqueId()

      // 存储生成的内容
      storeContent(contentId, response.content, type, selectedTemplateId, selectedTemplateName, response.tokenUsage)

      // 更新最近生成的内容
      const recent = getRecentContent(8)
      setRecentGenerations(recent)

      // 重定向到生成结果页面
      router.push(`/${contentId}`)
    } catch (error) {
      console.error("Error generating content:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setIsGenerating(false)
    }
  }

  // 获取当前类型的所有模板
  const templates = getTemplatesByType(type)

  return (
    <div className="grid gap-8 max-w-[670px] mx-auto mt-6">
      <div className="space-y-6">
        <div className="border border-primary rounded-xl overflow-hidden w-full">
          <div className="bg-white p-6">
            <Textarea
              placeholder={t("textPlaceholder")}
              className="min-h-[190px] resize-none border-0 focus:ring-0 p-0 shadow-none text-base"
              value={text}
              onChange={handleTextChange}
            />
          </div>

          <div className="border-t flex items-center justify-between px-4 py-2 bg-gray-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:text-primary/90">
                  <Code className="h-4 w-4" />
                  {selectedTemplateName}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() =>
                      handleTemplateSelect(template.id, language === "zh" ? template.name : template.nameEn)
                    }
                    className={selectedTemplateId === template.id ? "bg-muted" : ""}
                  >
                    {language === "zh" ? template.name : template.nameEn}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              {tokenCount !== null && <span className="text-xs text-muted-foreground">{tokenCount} tokens</span>}
              <Button
                onClick={generateContent}
                disabled={!text.trim() || isGenerating || !selectedTemplateId}
                size="sm"
                className="h-8 px-3 rounded-full bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-1" />
                    {t("startConverting")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {type === "cover" && "选择封面图模板"}
            {type === "card" && "选择文字卡模板"}
            {type === "diagram" && "选择逻辑图模板"}
          </h2>
          <p className="text-muted-foreground text-left mb-4">
            {type === "cover" && "将文本精简化，适用于为长内容设计小红书、公众号封面"}
            {type === "card" && "将文章内容提炼成简洁的文字卡片，适合分享和传播"}
            {type === "diagram" && "将复杂逻辑可视化，帮助理解和记忆"}
          </p>
          <TemplateCarousel type={type} selectedTemplate={selectedTemplateId} onSelectTemplate={handleTemplateSelect} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("recentGenerations")}</h2>
          <RecentGenerations recentGenerations={recentGenerations} noRecentText={t("noRecentImages")} />
        </div>
      </div>
    </div>
  )
}
