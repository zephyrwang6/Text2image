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
  const [error, setError] = useState<string | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [tokenCount, setTokenCount] = useState<number | null>(null)
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

      // 处理流式响应
      if (response.success && response.stream) {
        console.log(`[${new Date().toISOString()}] 开始处理流式响应`);
        const startTime = Date.now();
        // 处理流式响应
        const reader = response.stream.getReader();
        let completeContent = '';
        let decoder = new TextDecoder();
        let chunkCounter = 0;
        let isComplete = false;
        
        // 重置token计数
        setTokenCount(0);
        let currentTokenCount = 0;
        
        // 设置一个监控计时器，每5秒记录一次状态
        const monitorInterval = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
          console.log(`[${new Date().toISOString()}] 流处理状态监控: 已运行${elapsedTime}秒，接收${chunkCounter}个数据块，当前内容长度${completeContent.length}字符`);
        }, 5000);

        try {
          while (true) {
            const readStartTime = Date.now();
            console.log(`[${new Date().toISOString()}] 开始读取数据块...`);
            const { done, value } = await reader.read();
            const readTime = Date.now() - readStartTime;
            
            if (done) {
              console.log(`[${new Date().toISOString()}] 流读取完成，总用时: ${Math.floor((Date.now() - startTime) / 1000)}秒`);
              isComplete = true;
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            chunkCounter++;
            console.log(`[${new Date().toISOString()}] 接收数据块 #${chunkCounter}: 大小 ${value.length} 字节，读取耗时 ${readTime}ms`);
            console.log(`数据块前100个字符:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
            
            // 处理事件流格式，格式为 "data: {...}\n\n"
            const lines = chunk.split('\n\n').filter(Boolean);
            console.log(`[${new Date().toISOString()}] 数据块包含 ${lines.length} 行数据`);
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(5);
                
                // 检查是否是结束标记
                if (data.trim() === '[DONE]') {
                  isComplete = true;
                  continue;
                }
                
                try {
                  // 确保data是有效的JSON
                  if (!data.trim()) continue;
                  
                  const parsed = JSON.parse(data);
                  
                  // 检查是否是完成标记
                  if (parsed.finish_reason === 'stop' || parsed.finish_reason === 'length') {
                    isComplete = true;
                  }
                  
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
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] 流处理过程中发生错误:`, error);
          setError(`读取生成内容时发生错误: ${error.message || '未知错误'}`);
        } finally {
          clearInterval(monitorInterval);
          console.log(`[${new Date().toISOString()}] 流处理结束，总耗时: ${Math.floor((Date.now() - startTime) / 1000)}秒，数据块数: ${chunkCounter}，最终内容长度: ${completeContent.length}`);
        }
        
        // 处理最后一个解码 - 确保所有数据都被解码
        const finalChunk = decoder.decode();
        if (finalChunk) {
          console.log(`[${new Date().toISOString()}] 处理最终数据块，长度: ${finalChunk.length}`);
          // 处理最后可能的数据
          const lines = finalChunk.split('\n\n').filter(Boolean);
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const data = line.slice(5);
                if (!data.trim()) continue;
                
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0]) {
                  if (parsed.choices[0].delta && parsed.choices[0].delta.content) {
                    completeContent += parsed.choices[0].delta.content;
                  } else if (parsed.choices[0].message && parsed.choices[0].message.content) {
                    completeContent += parsed.choices[0].message.content;
                  }
                }
              } catch (e) {
                console.error('Error parsing final chunk:', e);
              }
            }
          }
        }

        // 检查是否成功提取到内容
        if (!completeContent.trim()) {
          console.error(`[${new Date().toISOString()}] 未能从流式响应中提取到有效内容`);
          throw new Error("获取内容失败，未能从响应中提取到有效内容");
        }

        console.log(`[${new Date().toISOString()}] 成功从流中提取内容，总长度: ${completeContent.length}`);
        console.log("内容前100个字符:", completeContent.substring(0, 100) + (completeContent.length > 100 ? '...' : ''));
        console.log("内容末尾100个字符:", completeContent.substring(completeContent.length - 100) + (completeContent.length > 100 ? '...' : ''));
        console.log(`[${new Date().toISOString()}] 最终token计数: ${currentTokenCount}`);
        console.log(`[${new Date().toISOString()}] 响应是否完成: ${isComplete}`);

        // 验证内容有效性 - 检查是否包含SVG或HTML
        const hasValidContent = completeContent.includes("<svg") || 
                               completeContent.includes("<html") || 
                               completeContent.includes("<body") || 
                               completeContent.includes("<div");
                               
        if (hasValidContent) {
          console.log(`[${new Date().toISOString()}] 检测到有效内容标签: ${
            completeContent.includes("<svg") ? "SVG" : 
            completeContent.includes("<html") ? "HTML" : 
            completeContent.includes("<body") ? "BODY" : "DIV"
          }`);
          
          // 记录关键标签位置
          const svgStartIndex = completeContent.indexOf("<svg");
          const svgEndIndex = completeContent.lastIndexOf("</svg>");
          const htmlStartIndex = completeContent.indexOf("<html");
          const htmlEndIndex = completeContent.lastIndexOf("</html>");
          
          if (svgStartIndex !== -1) {
            console.log(`[${new Date().toISOString()}] SVG标签位置: 开始=${svgStartIndex}, 结束=${svgEndIndex}, 长度=${svgEndIndex - svgStartIndex + 6}`);
          }
          if (htmlStartIndex !== -1) {
            console.log(`[${new Date().toISOString()}] HTML标签位置: 开始=${htmlStartIndex}, 结束=${htmlEndIndex}, 长度=${htmlEndIndex - htmlStartIndex + 7}`);
          }
        }
        
        if (!hasValidContent) {
          console.error(`[${new Date().toISOString()}] 生成的内容不包含有效的SVG或HTML代码`);
          setError("生成内容无效，请重试或尝试不同的输入");
          setIsGenerating(false);
          return;
        }
        
        if (!isComplete) {
          console.error(`[${new Date().toISOString()}] API响应未完成，不进行跳转`);
          setError("内容生成未完成，请重试");
          setIsGenerating(false);
          return;
        }

        // 生成唯一ID
        const contentId = generateUniqueId();

        // 存储生成的内容
        storeContent(contentId, completeContent, type, selectedTemplateId, selectedTemplateName, {
          promptTokens: Math.floor(currentTokenCount * 0.3), // 估算值
          completionTokens: Math.floor(currentTokenCount * 0.7), // 估算值
          totalTokens: currentTokenCount
        });

        // 更新最近生成的内容
        const recent = getRecentContent(8);
        setRecentGenerations(recent);

        // 将 isGenerating 设置为 false
        setIsGenerating(false);

        // 内容已完整接收且有效，现在安全地重定向到生成结果页面
        console.log("内容生成完成，正在跳转到预览页面...");
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
      const contentId = generateUniqueId()

      // 存储生成的内容
      storeContent(contentId, response.content, type, selectedTemplateId, selectedTemplateName, response.tokenUsage)

      // 更新最近生成的内容
      const recent = getRecentContent(8)
      setRecentGenerations(recent)

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
              {tokenCount !== null && (
                <span className={`text-xs ${isGenerating ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
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

