"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, ChevronDown, ArrowRight, Code, Loader2, ChevronRight, Sparkles } from "lucide-react"
import TemplateCarousel from "@/components/template-carousel"
import RecentGenerations from "@/components/recent-generations"
import { useLanguage } from "@/hooks/use-language"
import { getTemplateById, getTemplatesByType } from "@/lib/templates"
import { generateAIContent } from "@/lib/api"
import { storeContent, generateUniqueId, getRecentContent } from "@/lib/storage"
import { storeBlobContent, generateBlobId, getRecentBlobContents } from "@/lib/blob-storage"
import { calculateTokens } from "@/lib/token-calculator"
import { models, getDefaultModel, getModelById } from "@/lib/models"
import { ModelOption } from "@/lib/types"

interface TextToImageConverterProps {
  type: "cover" | "card" | "diagram"
  selectedTemplate?: string
  sharedText?: string
  setSharedText?: React.Dispatch<React.SetStateAction<string>>
  onTypeChange?: (newType: "cover" | "card" | "diagram") => void
}

export default function TextToImageConverter({ type, selectedTemplate, sharedText, setSharedText, onTypeChange }: TextToImageConverterProps) {
  const router = useRouter()
  const [text, setText] = useState(sharedText || "")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [selectedTemplateName, setSelectedTemplateName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [tokenCount, setTokenCount] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelOption>(getDefaultModel())
  const { language, t } = useLanguage()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 使用共享文本
  useEffect(() => {
    if (sharedText !== undefined) {
      setText(sharedText)
    }
  }, [sharedText])

  // 加载最近生成的内容
  useEffect(() => {
    const loadRecentContents = async () => {
      try {
        // 尝试从Blob存储加载
        const blobContents = await getRecentBlobContents(8);
        if (blobContents && blobContents.length > 0) {
          setRecentGenerations(blobContents);
          return;
        }
        
        // 回退到内存存储
        const recent = getRecentContent(8);
        setRecentGenerations(recent);
      } catch (error) {
        console.error("加载最近内容失败:", error);
        // 回退到内存存储
        const recent = getRecentContent(8);
        setRecentGenerations(recent);
      }
    };
    
    loadRecentContents();
  }, []);

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

  // 监听输入变化，计算token数量
  useEffect(() => {
    if (text) {
      const count = calculateTokens(text)
      setTokenCount(count)
    } else {
      setTokenCount(0)
    }
  }, [text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    // 更新共享文本状态
    if (setSharedText) {
      setSharedText(newText)
    }
  }

  const handleTemplateSelect = (templateId: string, templateName: string) => {
    setSelectedTemplateId(templateId)
    setSelectedTemplateName(templateName)
  }

  const handleModelChange = (modelId: string) => {
    const model = getModelById(modelId)
    if (model) {
      setSelectedModel(model)
    }
  }

  const generateContent = async () => {
    if (!text.trim() || !selectedTemplateId) return

    setIsGenerating(true)
    setError(null)

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
        modelId: selectedModel.id // 添加选中的模型ID
      })

      // 处理流式响应
      if (response.success && response.stream) {
        console.log("开始处理流式响应");
        // 处理流式响应
        const reader = response.stream.getReader();
        let completeContent = '';
        let decoder = new TextDecoder();
        let chunkCounter = 0;
        
        // 重置token计数
        setTokenCount(0);
        let currentTokenCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("流读取完成");
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          chunkCounter++;
          console.log(`接收数据块 #${chunkCounter}:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
          
          // 处理事件流格式，格式为 "data: {...}\n\n"
          const lines = chunk.split('\n\n').filter(Boolean);
          console.log(`数据块包含 ${lines.length} 行数据`);
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(5);
              
              // 检查是否是结束标记
              if (data.trim() === '[DONE]') continue;
              
              try {
                // 确保data是有效的JSON
                if (!data.trim()) continue;
                
                const parsed = JSON.parse(data);
                
                // 更新token计数 - 尝试从多种可能的格式中获取token信息
                if (parsed.usage) {
                  currentTokenCount = parsed.usage.total_tokens || parsed.usage.totalTokens || 0;
                  setTokenCount(currentTokenCount);
                } else if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  // 对于每个增量内容，估算token数并增加计数
                  // 这是一个简单估算，每4个字符约为1个token
                  const tokenIncrement = Math.ceil(parsed.choices[0].delta.content.length / 4);
                  currentTokenCount += tokenIncrement;
                  setTokenCount(currentTokenCount);
                }
                
                if (parsed.choices && parsed.choices[0]) {
                  // 处理增量内容更新
                  if (parsed.choices[0].delta && parsed.choices[0].delta.content) {
                    completeContent += parsed.choices[0].delta.content;
                  }
                  // 处理完整消息内容
                  else if (parsed.choices[0].message && parsed.choices[0].message.content) {
                    completeContent += parsed.choices[0].message.content;
                  }
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e, 'Raw data:', data);
              }
            }
          }
        }

        // 检查是否成功提取到内容
        if (!completeContent.trim()) {
          console.error("未能从流式响应中提取到有效内容");
          throw new Error("获取内容失败，未能从响应中提取到有效内容");
        }

        console.log("成功从流中提取内容，总长度:", completeContent.length);
        console.log("内容预览:", completeContent.substring(0, 100) + (completeContent.length > 100 ? '...' : ''));
        console.log("最终token计数:", currentTokenCount);

        // 生成唯一ID
        const contentId = generateBlobId();

        // 存储生成的内容到Blob存储
        try {
          await storeBlobContent(contentId, completeContent, type, selectedTemplateId, selectedTemplateName, {
            promptTokens: Math.floor(currentTokenCount * 0.3), // 估算值
            completionTokens: Math.floor(currentTokenCount * 0.7), // 估算值
            totalTokens: currentTokenCount
          });
          
          // 更新最近生成的内容
          const blobContents = await getRecentBlobContents(8);
          setRecentGenerations(blobContents);
        } catch (blobError) {
          console.error("存储到Blob失败，回退到内存存储:", blobError);
          
          // 回退到内存存储
          storeContent(contentId, completeContent, type, selectedTemplateId, selectedTemplateName, {
            promptTokens: Math.floor(currentTokenCount * 0.3),
            completionTokens: Math.floor(currentTokenCount * 0.7),
            totalTokens: currentTokenCount
          });
          
          // 更新最近生成的内容
          const recent = getRecentContent(8);
          setRecentGenerations(recent);
        }

        // 将 isGenerating 设置为 false
        setIsGenerating(false);

        // 重定向到生成结果页面
        router.push(`/${contentId}`);
        return;
      }

      // 非流式响应处理
      if (!response.success || !response.content) {
        throw new Error(response.error || "Failed to generate content")
      }

      // 设置token计数
      if (response.tokenUsage) {
        setTokenCount(response.tokenUsage.totalTokens)
      }

      // 生成唯一ID
      const contentId = generateBlobId();

      // 尝试存储到Blob
      try {
        await storeBlobContent(contentId, response.content, type, selectedTemplateId, selectedTemplateName, response.tokenUsage);
        
        // 更新最近生成的内容
        const blobContents = await getRecentBlobContents(8);
        setRecentGenerations(blobContents);
      } catch (blobError) {
        console.error("存储到Blob失败，回退到内存存储:", blobError);
        
        // 回退到内存存储
        storeContent(contentId, response.content, type, selectedTemplateId, selectedTemplateName, response.tokenUsage);
        
        // 更新最近生成的内容
        const recent = getRecentContent(8);
        setRecentGenerations(recent);
      }

      // 将 isGenerating 设置为 false
      setIsGenerating(false)

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

  // 获取下一个类型
  const getNextType = (): "cover" | "card" | "diagram" => {
    if (type === "cover") return "card"
    if (type === "card") return "diagram"
    return "cover"
  }

  // 处理类型切换
  const handleTypeChange = () => {
    if (onTypeChange) {
      onTypeChange(getNextType())
    }
  }

  return (
    <div className="grid gap-4 sm:gap-8 w-full max-w-[320px] sm:max-w-2xl mx-auto overflow-hidden">
      <div className="space-y-4 sm:space-y-6">
        <div className="border border-primary rounded-xl overflow-hidden w-full max-w-[320px] sm:max-w-full mx-auto">
          <div className="bg-background p-2 sm:p-6">
            <Textarea
              ref={textareaRef}
              placeholder={t("textPlaceholder")}
              className="min-h-[120px] sm:min-h-[200px] w-full resize-none border-0 focus:ring-0 p-0 shadow-none text-sm sm:text-base bg-transparent"
              value={text}
              onChange={handleTextChange}
            />
          </div>

          <div className="border-t flex flex-wrap items-center justify-between px-1 sm:px-4 py-1 sm:py-2 bg-muted">
            <div className="flex items-center gap-2 flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 sm:h-8 text-xs sm:text-sm gap-1 text-muted-foreground hover:text-foreground">
                    <Code className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="max-w-[60px] sm:max-w-full truncate">{selectedTemplateName}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 sm:w-56">
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
              
              <Select
                value={selectedModel.id}
                onValueChange={handleModelChange}
              >
                <SelectTrigger 
                  className="h-6 sm:h-8 text-xs sm:text-sm w-[180px] sm:w-[200px] border-0 bg-transparent focus:ring-0 text-muted-foreground"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>{selectedModel.name}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {tokenCount !== null && (
                <span className={`text-xs ${isGenerating ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                  {t("tokens")}: {tokenCount}
                </span>
              )}
              <Button
                onClick={generateContent}
                disabled={!text.trim() || isGenerating || !selectedTemplateId}
                size="sm"
                className="h-6 sm:h-8 px-2 sm:px-3 rounded-full bg-primary hover:bg-primary/90 text-xs sm:text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {t("startConverting")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
      </div>

      <div className="space-y-3 sm:space-y-4 max-w-[320px] sm:max-w-full mx-auto w-full">
        <div>
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <h2 className="text-lg sm:text-2xl font-semibold">
              {type === "cover" && "选择封面图模板"}
              {type === "card" && "选择文字卡模板"}
              {type === "diagram" && "选择逻辑图模板"}
            </h2>
            {onTypeChange && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleTypeChange} 
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <span className="hidden sm:inline">
                  {type === "cover" && "切换到文字卡"}
                  {type === "card" && "切换到逻辑图"}
                  {type === "diagram" && "切换到封面图"}
                </span>
                <span className="sm:hidden">
                  {type === "cover" && "文字卡"}
                  {type === "card" && "逻辑图"}
                  {type === "diagram" && "封面图"}
                </span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
            {type === "cover" && "将文本精简化，适用于为长内容设计小红书、公众号封面"}
            {type === "card" && "将文章内容提炼成简洁的文字卡片，适合分享和传播"}
            {type === "diagram" && "将复杂逻辑可视化，帮助理解和记忆"}
          </p>
          <div className="w-full max-w-[320px] sm:max-w-full mx-auto">
            <TemplateCarousel type={type} selectedTemplate={selectedTemplateId} onSelectTemplate={handleTemplateSelect} />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2 sm:mt-4">鸣谢提示词创作者：向阳乔木、空格的键盘、橘子AI</p>
        </div>

        <div>
          <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4">{t("recentGenerations")}</h2>
          <RecentGenerations recentGenerations={recentGenerations} noRecentText={t("noRecentImages")} />
        </div>
      </div>
    </div>
  )
}

