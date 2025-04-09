// 简单的内存存储，在生产环境中应该使用数据库
interface StoredContent {
  id: string
  content: string
  type: "cover" | "card" | "diagram"
  createdAt: Date
  templateId: string
  templateName: string
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 用于存储生成的内容
const contentStore: Record<string, StoredContent> = {}

// 存储最近生成的内容ID，最多保存20个
const recentContentIds: string[] = []
const MAX_RECENT_ITEMS = 20

export function storeContent(
  id: string,
  content: string,
  type: "cover" | "card" | "diagram",
  templateId: string,
  templateName: string,
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  },
): StoredContent {
  const contentItem: StoredContent = {
    id,
    content,
    type,
    createdAt: new Date(),
    templateId,
    templateName,
    tokenUsage,
  }

  contentStore[id] = contentItem

  // 添加到最近生成列表
  recentContentIds.unshift(id)
  if (recentContentIds.length > MAX_RECENT_ITEMS) {
    recentContentIds.pop()
  }

  return contentItem
}

export function getContent(id: string): StoredContent | null {
  return contentStore[id] || null
}

export function getRecentContent(limit = 4): StoredContent[] {
  return recentContentIds
    .slice(0, limit)
    .map((id) => contentStore[id])
    .filter(Boolean)
}

// 生成唯一ID
export function generateUniqueId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// 从内容中提取SVG代码
export function extractSvgContent(content: string): string | null {
  // 首先尝试处理可能的 markdown 代码块
  const markdownSvgMatch = content.match(/```(?:svg)?\s*([\s\S]*?)<svg[\s\S]*?<\/svg>[\s\S]*?```/)
  if (markdownSvgMatch) {
    const innerContent = markdownSvgMatch[1] + markdownSvgMatch[0].match(/<svg[\s\S]*?<\/svg>/)?.[0]
    return innerContent.match(/<svg[\s\S]*?<\/svg>/)?.[0] || null
  }

  // 常规SVG提取
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/)
  return svgMatch ? svgMatch[0] : null
}

// 从内容中提取HTML代码
export function extractHtmlContent(content: string): string | null {
  // 首先尝试处理可能的 markdown 代码块
  const markdownHtmlMatch = content.match(/```(?:html)?\s*([\s\S]*?)(?:<html[\s\S]*?<\/html>|<body[\s\S]*?<\/body>|<div[\s\S]*?<\/div>)[\s\S]*?```/)
  if (markdownHtmlMatch) {
    const innerContent = markdownHtmlMatch[1] + (
      markdownHtmlMatch[0].match(/<html[\s\S]*?<\/html>/) || 
      markdownHtmlMatch[0].match(/<body[\s\S]*?<\/body>/) || 
      markdownHtmlMatch[0].match(/<div[\s\S]*?<\/div>/)
    )?.[0]
    
    // 尝试按优先顺序提取
    const htmlMatch = innerContent.match(/<html[\s\S]*?<\/html>/) || 
                      innerContent.match(/<body[\s\S]*?<\/body>/) || 
                      innerContent.match(/<div[\s\S]*?<\/div>/)
    
    return htmlMatch ? htmlMatch[0] : null
  }

  // 常规HTML提取，尝试提取完整的HTML文档
  let htmlMatch = content.match(/<html[\s\S]*?<\/html>/)
  if (htmlMatch) return htmlMatch[0]

  // 尝试提取body标签
  htmlMatch = content.match(/<body[\s\S]*?<\/body>/)
  if (htmlMatch) return htmlMatch[0]

  // 尝试提取div标签
  htmlMatch = content.match(/<div[\s\S]*?<\/div>/)
  if (htmlMatch) return htmlMatch[0]

  // 如果没有找到任何HTML标签，返回null
  return null
}

// 从内容中提取代码，优先提取SVG，其次是HTML
export function extractCodeContent(content: string, type: "cover" | "card" | "diagram"): string | null {
  // 首先尝试删除任何markdown代码块的开始和结束标记，以便更好地提取内容
  let processedContent = content;
  
  // 移除可能的markdown代码块标记
  if (content.includes("```")) {
    // 替换所有的markdown代码块标记为空字符串，但保留其中的内容
    processedContent = content.replace(/```(?:svg|html)?\s*\n?/g, '')
                             .replace(/\n?```/g, '');
  }

  if (type === "cover" || type === "diagram") {
    // 对于封面和图表，优先提取SVG
    const svgContent = extractSvgContent(processedContent)
    if (svgContent) return svgContent
  }

  // 尝试提取HTML
  const htmlContent = extractHtmlContent(processedContent)
  if (htmlContent) return htmlContent

  // 如果是SVG或HTML，但上面的提取失败了，尝试更宽松的匹配
  if (processedContent.includes("<svg") || processedContent.includes("<html") || processedContent.includes("<div")) {
    console.log("使用宽松匹配提取内容");
    // 如果内容是以```开始的代码块，尝试更加激进地移除markdown标记
    if (processedContent.trim().startsWith("```")) {
      processedContent = processedContent.replace(/```[\s\S]*?\n/, '') // 移除开始标记
                                        .replace(/\n```$/, '');         // 移除结束标记
    }
    return processedContent;
  }

  // 如果没有找到任何代码，返回null
  return null
}

