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
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/)
  return svgMatch ? svgMatch[0] : null
}

// 从内容中提取HTML代码
export function extractHtmlContent(content: string): string | null {
  // 尝试提取完整的HTML文档
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
  if (type === "cover" || type === "diagram") {
    // 对于封面和图表，优先提取SVG
    const svgContent = extractSvgContent(content)
    if (svgContent) return svgContent
  }

  // 尝试提取HTML
  const htmlContent = extractHtmlContent(content)
  if (htmlContent) return htmlContent

  // 如果是SVG或HTML，但上面的提取失败了，尝试更宽松的匹配
  if (content.includes("<svg") || content.includes("<html") || content.includes("<div")) {
    return content
  }

  // 如果没有找到任何代码，返回null
  return null
}

