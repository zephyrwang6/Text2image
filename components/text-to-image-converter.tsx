"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RefreshCw, ChevronDown, ArrowRight, Code, Loader2 } from "lucide-react"
import TemplateCarousel from "@/components/template-carousel"
import RecentGenerations from "@/components/recent-generations"
import { useLanguage } from "@/hooks/use-language"
import { getTemplateById, getTemplatesByType } from "@/lib/templates"
import { generateAIContent } from "@/lib/api"
import { storeContent, generateUniqueId, getRecentContent } from "@/lib/storage"
import { calculateTokens } from "@/lib/token-calculator"

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
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [tokenCount, setTokenCount] = useState<number | null>(null)
  const [generatingTokenCount, setGeneratingTokenCount] = useState<number>(0)
  const { language, t } = useLanguage()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    setGeneratingTokenCount(0)

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

      if (!response.success) {
        throw new Error(response.error || "Failed to generate content")
      }

      // 处理流式响应
      if (response.stream) {
        setIsStreaming(true);
        // 读取流
        const reader = response.stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let completeContent = "";
        let partialTokenUsage = null;
        let currentCompletionTokens = 0;

        try {
          let receivedDone = false;  // 标记是否收到完成信号
          
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            // 解码数据
            const chunk = decoder.decode(value, { stream: true });  // 启用流式解码
            
            // 处理服务器发送的事件
            const events = chunk.split('\n\n').filter(Boolean);
            
            for (const event of events) {
              if (event === 'data: [DONE]') {
                receivedDone = true;
                continue;
              }
              
              if (event.startsWith('data: ')) {
                try {
                  const jsonPart = event.slice(5);
                  // 尝试解析JSON，处理可能的错误
                  try {
                    const jsonData = JSON.parse(jsonPart);
                    
                    // 获取生成的文本
                    if (jsonData.choices?.[0]?.delta?.content) {
                      const content = jsonData.choices[0].delta.content;
                      completeContent += content;
                      
                      // 简单估算tokens：加上当前生成的内容长度
                      // 中文字符计算为2个token，英文字符为1个token
                      const chineseCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
                      const nonChineseCount = content.length - chineseCount;
                      const estimatedTokens = chineseCount * 2 + nonChineseCount;
                      
                      // 累加到已生成的tokens计数中
                      currentCompletionTokens += estimatedTokens;
                      setGeneratingTokenCount(currentCompletionTokens);
                    }
                    
                    // 收集 token 使用信息
                    if (jsonData.usage) {
                      partialTokenUsage = jsonData.usage;
                      // 如果API返回了精确的token计数，则使用API的计数
                      if (jsonData.usage.completion_tokens) {
                        currentCompletionTokens = jsonData.usage.completion_tokens;
                        setGeneratingTokenCount(currentCompletionTokens);
                      }
                    }
                  } catch (jsonError) {
                    // JSON解析错误，可能是包含代码块或特殊字符
                    console.warn("JSON解析错误，尝试手动提取内容:", jsonError);
                    
                    // 直接从原始数据中提取内容，跳过JSON解析
                    // 查找可能的内容片段
                    const contentMatch = jsonPart.match(/"content":\s*"([^"]*)/);
                    if (contentMatch && contentMatch[1]) {
                      let extractedContent = contentMatch[1];
                      // 处理转义字符
                      extractedContent = extractedContent.replace(/\\n/g, '\n')
                                                        .replace(/\\"/g, '"')
                                                        .replace(/\\\\/g, '\\');
                      
                      completeContent += extractedContent;
                      
                      // 估算token
                      const chineseCount = (extractedContent.match(/[\u4e00-\u9fa5]/g) || []).length;
                      const nonChineseCount = extractedContent.length - chineseCount;
                      const estimatedTokens = chineseCount * 2 + nonChineseCount;
                      
                      currentCompletionTokens += estimatedTokens;
                      setGeneratingTokenCount(currentCompletionTokens);
                    }
                  }
                } catch (e) {
                  console.error("Error processing stream event:", e);
                }
              }
            }
          }
          
          // 确认是否正常完成了生成过程
          if (!receivedDone && completeContent.length === 0) {
            throw new Error("Stream ended prematurely without content");
          }
        } catch (e) {
          console.error("Error reading stream:", e);
          throw e;
        } finally {
          reader.releaseLock();
          setIsStreaming(false);
        }

        // 流处理完毕，设置结果
        if (!completeContent) {
          throw new Error("No content received from stream")
        }

        console.log("完整内容生成完毕，准备存储和跳转", completeContent.length);

        // 将token使用情况转换为我们的格式
        const tokenUsage = partialTokenUsage ? {
          promptTokens: partialTokenUsage.prompt_tokens || 0,
          completionTokens: partialTokenUsage.completion_tokens || 0,
          totalTokens: partialTokenUsage.total_tokens || 0
        } : undefined;

        // 设置token计数
        if (tokenUsage) {
          setTokenCount(tokenUsage.totalTokens);
        }

        // 生成唯一ID
        const contentId = generateUniqueId();

        // 存储生成的内容
        storeContent(contentId, completeContent, type, selectedTemplateId, selectedTemplateName, tokenUsage);

        // 更新最近生成的内容
        const recent = getRecentContent(8);
        setRecentGenerations(recent);

        // 将状态重置
        setIsGenerating(false);
        
        // 给一个短暂延迟，确保所有状态都已更新
        setTimeout(() => {
          router.push(`/${contentId}`);
        }, 300);
      } else if (response.content) {
        // 非流式响应的处理（原有逻辑）
        // 设置token计数
        if (response.tokenUsage) {
          setTokenCount(response.tokenUsage.totalTokens);
        }

        // 生成唯一ID
        const contentId = generateUniqueId();

        // 存储生成的内容
        storeContent(contentId, response.content, type, selectedTemplateId, selectedTemplateName, response.tokenUsage);

        // 更新最近生成的内容
        const recent = getRecentContent(8);
        setRecentGenerations(recent);

        // 将 isGenerating 设置为 false
        setIsGenerating(false);

        // 给一个短暂延迟，确保所有状态都已更新
        setTimeout(() => {
          router.push(`/${contentId}`);
        }, 300);
      } else {
        throw new Error("No content received from API");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setIsGenerating(false);
    }
  }

  // 获取当前类型的所有模板
  const templates = getTemplatesByType(type)

  return (
    <div className="grid gap-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="border border-primary rounded-xl overflow-hidden w-full">
          <div className="bg-background p-6">
            <Textarea
              ref={textareaRef}
              placeholder={t("textPlaceholder")}
              className="min-h-[200px] resize-none border-0 focus:ring-0 p-0 shadow-none text-base bg-transparent"
              value={text}
              onChange={handleTextChange}
            />
          </div>

          <div className="border-t flex items-center justify-between px-4 py-2 bg-muted">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
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
              {(isStreaming || isGenerating) && generatingTokenCount > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {t("tokens")}: {generatingTokenCount}
                </span>
              ) : tokenCount !== null && (
                <span className="text-xs text-muted-foreground">
                  {t("tokens")}: {tokenCount}
                </span>
              )}
              <Button
                onClick={generateContent}
                disabled={!text.trim() || isGenerating || !selectedTemplateId}
                size="sm"
                className="h-8 px-3 rounded-full bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    {isStreaming ? t("streaming") : t("generating")}
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

        {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md">{error}</div>}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            {type === "cover" && "选择封面图模板"}
            {type === "card" && "选择文字卡模板"}
            {type === "diagram" && "选择逻辑图模板"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {type === "cover" && "将文本精简化，适用于为长内容设计小红书、公众号封面"}
            {type === "card" && "将文章内容提炼成简洁的文字卡片，适合分享和传播"}
            {type === "diagram" && "将复杂逻辑可视化，帮助理解和记忆"}
          </p>
          <TemplateCarousel type={type} selectedTemplate={selectedTemplateId} onSelectTemplate={handleTemplateSelect} />
          <p className="text-xs text-muted-foreground text-center mt-4">鸣谢提示词创作者：向阳乔木、空格的键盘、橘子AI</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("recentGenerations")}</h2>
          <RecentGenerations recentGenerations={recentGenerations} noRecentText={t("noRecentImages")} />
        </div>
      </div>
    </div>
  )
}
