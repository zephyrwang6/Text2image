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
  if (!content || typeof content !== 'string') {
    console.error("提取内容错误: 无效内容", content);
    return null;
  }
  
  // 记录提取开始
  console.log("开始提取内容，长度:", content.length);
  console.log("内容前100个字符:", content.substring(0, 100));
  
  // 首先尝试删除任何markdown代码块的开始和结束标记，以便更好地提取内容
  let processedContent = content;
  
  // 移除可能的markdown代码块标记
  if (content.includes("```")) {
    console.log("检测到代码块标记，处理中...");
    
    // 替换所有的markdown代码块标记为空字符串，但保留其中的内容
    processedContent = content.replace(/```(?:svg|html)?\s*\n?/g, '')
                             .replace(/\n?```/g, '');
    console.log("处理后内容长度:", processedContent.length);
  }

  // 尝试直接找出内容中的第一个有效SVG或HTML块
  let extracted = null;
  
  if (type === "cover" || type === "diagram") {
    // 对于封面和图表，优先提取SVG
    extracted = extractSvgContent(processedContent);
    if (extracted) {
      console.log("成功提取SVG内容，长度:", extracted.length);
      return extracted;
    }
  }

  // 尝试提取HTML
  extracted = extractHtmlContent(processedContent);
  if (extracted) {
    console.log("成功提取HTML内容，长度:", extracted.length);
    return extracted;
  }

  // 如果是SVG或HTML，但上面的提取失败了，尝试更宽松的匹配
  if (processedContent.includes("<svg") || processedContent.includes("<html") || processedContent.includes("<div")) {
    console.log("使用宽松匹配提取内容");
    
    // 如果内容是以```开始的代码块，尝试更加激进地移除markdown标记
    if (processedContent.trim().startsWith("```")) {
      processedContent = processedContent.replace(/```[\s\S]*?\n/, '') // 移除开始标记
                                        .replace(/\n```$/, '');         // 移除结束标记
    }
    
    // 如果内容包含<svg>或<html>标签但上面的正则表达式没有匹配到，尝试使用更简单的方法
    const svgStartIndex = processedContent.indexOf("<svg");
    const htmlStartIndex = processedContent.indexOf("<html");
    const bodyStartIndex = processedContent.indexOf("<body");
    const divStartIndex = processedContent.indexOf("<div");
    
    if (svgStartIndex !== -1) {
      const svgEndIndex = processedContent.lastIndexOf("</svg>") + 6; // 6 是 </svg> 的长度
      if (svgEndIndex > svgStartIndex) {
        console.log("使用索引提取法提取SVG内容");
        return processedContent.substring(svgStartIndex, svgEndIndex);
      }
    }
    
    if (htmlStartIndex !== -1) {
      const htmlEndIndex = processedContent.lastIndexOf("</html>") + 7; // 7 是 </html> 的长度
      if (htmlEndIndex > htmlStartIndex) {
        console.log("使用索引提取法提取HTML内容");
        return processedContent.substring(htmlStartIndex, htmlEndIndex);
      }
    }
    
    if (bodyStartIndex !== -1) {
      const bodyEndIndex = processedContent.lastIndexOf("</body>") + 7; // 7 是 </body> 的长度
      if (bodyEndIndex > bodyStartIndex) {
        console.log("使用索引提取法提取BODY内容");
        return processedContent.substring(bodyStartIndex, bodyEndIndex);
      }
    }
    
    if (divStartIndex !== -1) {
      // 寻找匹配的结束div标签
      let openTags = 0;
      let currentIndex = divStartIndex;
      let foundClosingTag = false;
      
      while (currentIndex < processedContent.length) {
        const openTagIndex = processedContent.indexOf("<div", currentIndex);
        const closeTagIndex = processedContent.indexOf("</div>", currentIndex);
        
        if (openTagIndex === -1 && closeTagIndex === -1) break;
        
        if (openTagIndex !== -1 && (openTagIndex < closeTagIndex || closeTagIndex === -1)) {
          openTags++;
          currentIndex = openTagIndex + 4;
        } else if (closeTagIndex !== -1) {
          openTags--;
          currentIndex = closeTagIndex + 6;
          
          if (openTags === 0) {
            console.log("找到匹配的div标签");
            foundClosingTag = true;
            break;
          }
        }
      }
      
      if (foundClosingTag) {
        console.log("使用索引提取法提取DIV内容");
        return processedContent.substring(divStartIndex, currentIndex);
      }
    }
    
    // 如果以上方法都失败了，但我们确定内容包含SVG或HTML元素，返回整个处理后的内容
    console.log("无法精确提取，返回整个处理后内容");
    return processedContent;
  }

  // 尝试最后的努力 - 如果内容包含任何HTML标签，返回整个处理后的内容
  if (processedContent.match(/<[a-z][\s\S]*>/i)) {
    console.log("检测到HTML标签，返回处理后内容");
    return processedContent;
  }

  console.log("无法提取内容，返回null");
  // 如果没有找到任何代码，返回null
  return null;
}

