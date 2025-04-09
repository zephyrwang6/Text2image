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
  console.log(`[${new Date().toISOString()}] 进入extractSvgContent函数，内容长度: ${content.length}`);
  console.log(`[${new Date().toISOString()}] 内容前100个字符: ${content.substring(0, 100)}`);
  console.log(`[${new Date().toISOString()}] 内容末尾100个字符: ${content.substring(content.length - 100)}`);
  
  // 检查内容是否包含SVG标签
  const hasSvgOpenTag = content.includes("<svg");
  const hasSvgCloseTag = content.includes("</svg>");
  console.log(`[${new Date().toISOString()}] 检测SVG标签: 开始标签=${hasSvgOpenTag}, 结束标签=${hasSvgCloseTag}`);
  
  if (hasSvgOpenTag && hasSvgCloseTag) {
    const svgStartIndex = content.indexOf("<svg");
    const svgEndIndex = content.lastIndexOf("</svg>") + 6; // 6 是 "</svg>" 的长度
    console.log(`[${new Date().toISOString()}] SVG标签位置: 开始=${svgStartIndex}, 结束=${svgEndIndex}`);
    
    // 检查标签位置是否合理
    if (svgStartIndex >= 0 && svgEndIndex > svgStartIndex) {
      console.log(`[${new Date().toISOString()}] SVG内容长度应为: ${svgEndIndex - svgStartIndex}`);
    }
  }
  
  // 首先尝试处理可能的 markdown 代码块
  const markdownSvgMatch = content.match(/```(?:svg)?\s*([\s\S]*?)<svg[\s\S]*?<\/svg>[\s\S]*?```/)
  if (markdownSvgMatch) {
    console.log(`[${new Date().toISOString()}] 匹配到markdown代码块中的SVG`);
    const innerContent = markdownSvgMatch[1] + markdownSvgMatch[0].match(/<svg[\s\S]*?<\/svg>/)?.[0]
    const result = innerContent.match(/<svg[\s\S]*?<\/svg>/)?.[0] || null
    console.log(`[${new Date().toISOString()}] 从markdown中提取的SVG长度: ${result ? result.length : 0}`);
    if (result) {
      console.log(`[${new Date().toISOString()}] 提取内容预览: ${result.substring(0, 100)}`);
    }
    return result;
  }

  // 常规SVG提取
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/)
  console.log(`[${new Date().toISOString()}] 常规SVG匹配结果: ${svgMatch ? "成功" : "失败"}`);
  
  if (svgMatch) {
    console.log(`[${new Date().toISOString()}] 匹配到的SVG内容长度: ${svgMatch[0].length}`);
    console.log(`[${new Date().toISOString()}] 匹配内容预览: ${svgMatch[0].substring(0, 100)}`);
    
    // 尝试使用不同的正则表达式，看是否能更好地匹配
    if (svgMatch[0].length < 100) {
      console.log(`[${new Date().toISOString()}] 警告: 提取的SVG内容异常短，尝试更宽松的匹配`);
      const altMatch = content.match(/<svg[^>]*>[\s\S]*?<\/svg>/);
      if (altMatch && altMatch[0].length > svgMatch[0].length) {
        console.log(`[${new Date().toISOString()}] 宽松匹配SVG结果长度: ${altMatch[0].length}`);
        return altMatch[0];
      }
    }
  } else if (hasSvgOpenTag && hasSvgCloseTag) {
    // 如果正则匹配失败但确实有SVG标签，尝试手动提取
    console.log(`[${new Date().toISOString()}] 正则匹配失败但存在SVG标签，尝试手动提取`);
    const svgStartIndex = content.indexOf("<svg");
    const svgEndIndex = content.lastIndexOf("</svg>") + 6;
    if (svgEndIndex > svgStartIndex) {
      const manuallyExtracted = content.substring(svgStartIndex, svgEndIndex);
      console.log(`[${new Date().toISOString()}] 手动提取SVG内容长度: ${manuallyExtracted.length}`);
      return manuallyExtracted;
    }
  }
  
  return svgMatch ? svgMatch[0] : null;
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
    console.error(`[${new Date().toISOString()}] 提取内容错误: 无效内容`, content);
    return null;
  }
  
  // 记录提取开始
  console.log(`[${new Date().toISOString()}] 开始提取内容，长度: ${content.length}`);
  console.log(`[${new Date().toISOString()}] 内容前100个字符: ${content.substring(0, 100)}`);
  console.log(`[${new Date().toISOString()}] 内容末尾100个字符: ${content.substring(Math.max(0, content.length - 100))}`);
  
  const extractStartTime = Date.now();
  
  // 首先尝试删除任何markdown代码块的开始和结束标记，以便更好地提取内容
  let processedContent = content;
  
  // 移除可能的markdown代码块标记
  if (content.includes("```")) {
    console.log(`[${new Date().toISOString()}] 检测到代码块标记，处理中...`);
    
    // 替换所有的markdown代码块标记为空字符串，但保留其中的内容
    processedContent = content.replace(/```(?:svg|html)?\s*\n?/g, '')
                             .replace(/\n?```/g, '');
    console.log(`[${new Date().toISOString()}] 处理后内容长度: ${processedContent.length}, 处理耗时: ${Date.now() - extractStartTime}ms`);
  }

  // 尝试直接找出内容中的第一个有效SVG或HTML块
  let extracted = null;
  
  if (type === "cover" || type === "diagram") {
    // 对于封面和图表，优先提取SVG
    console.log(`[${new Date().toISOString()}] 尝试提取SVG内容...`);
    const svgStartTime = Date.now();
    extracted = extractSvgContent(processedContent);
    if (extracted) {
      console.log(`[${new Date().toISOString()}] 成功提取SVG内容，长度: ${extracted.length}, 提取耗时: ${Date.now() - svgStartTime}ms`);
      return extracted;
    } else {
      console.log(`[${new Date().toISOString()}] SVG提取失败，耗时: ${Date.now() - svgStartTime}ms`);
    }
  }

  // 尝试提取HTML
  console.log(`[${new Date().toISOString()}] 尝试提取HTML内容...`);
  const htmlStartTime = Date.now();
  extracted = extractHtmlContent(processedContent);
  if (extracted) {
    console.log(`[${new Date().toISOString()}] 成功提取HTML内容，长度: ${extracted.length}, 提取耗时: ${Date.now() - htmlStartTime}ms`);
    return extracted;
  } else {
    console.log(`[${new Date().toISOString()}] HTML提取失败，耗时: ${Date.now() - htmlStartTime}ms`);
  }

  // 如果是SVG或HTML，但上面的提取失败了，尝试更宽松的匹配
  if (processedContent.includes("<svg") || processedContent.includes("<html") || processedContent.includes("<div")) {
    console.log(`[${new Date().toISOString()}] 使用宽松匹配提取内容`);
    
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
        console.log(`[${new Date().toISOString()}] 使用索引提取法提取SVG内容，范围: ${svgStartIndex}-${svgEndIndex}`);
        const result = processedContent.substring(svgStartIndex, svgEndIndex);
        console.log(`[${new Date().toISOString()}] 索引提取SVG结果长度: ${result.length}`);
        return result;
      }
    }
    
    if (htmlStartIndex !== -1) {
      const htmlEndIndex = processedContent.lastIndexOf("</html>") + 7; // 7 是 </html> 的长度
      if (htmlEndIndex > htmlStartIndex) {
        console.log(`[${new Date().toISOString()}] 使用索引提取法提取HTML内容，范围: ${htmlStartIndex}-${htmlEndIndex}`);
        const result = processedContent.substring(htmlStartIndex, htmlEndIndex);
        console.log(`[${new Date().toISOString()}] 索引提取HTML结果长度: ${result.length}`);
        return result;
      }
    }
    
    if (bodyStartIndex !== -1) {
      const bodyEndIndex = processedContent.lastIndexOf("</body>") + 7; // 7 是 </body> 的长度
      if (bodyEndIndex > bodyStartIndex) {
        console.log(`[${new Date().toISOString()}] 使用索引提取法提取BODY内容，范围: ${bodyStartIndex}-${bodyEndIndex}`);
        const result = processedContent.substring(bodyStartIndex, bodyEndIndex);
        console.log(`[${new Date().toISOString()}] 索引提取BODY结果长度: ${result.length}`);
        return result;
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
            console.log(`[${new Date().toISOString()}] 找到匹配的div标签，范围: ${divStartIndex}-${currentIndex}`);
            foundClosingTag = true;
            break;
          }
        }
      }
      
      if (foundClosingTag) {
        console.log(`[${new Date().toISOString()}] 使用索引提取法提取DIV内容，范围: ${divStartIndex}-${currentIndex}`);
        const result = processedContent.substring(divStartIndex, currentIndex);
        console.log(`[${new Date().toISOString()}] 索引提取DIV结果长度: ${result.length}`);
        return result;
      }
    }
    
    // 如果以上方法都失败了，但我们确定内容包含SVG或HTML元素，返回整个处理后的内容
    console.log(`[${new Date().toISOString()}] 无法精确提取，返回整个处理后内容，长度: ${processedContent.length}`);
    return processedContent;
  }

  // 尝试最后的努力 - 如果内容包含任何HTML标签，返回整个处理后的内容
  if (processedContent.match(/<[a-z][\s\S]*>/i)) {
    console.log(`[${new Date().toISOString()}] 检测到HTML标签，返回处理后内容，长度: ${processedContent.length}`);
    return processedContent;
  }

  console.log(`[${new Date().toISOString()}] 无法提取内容，返回null，总耗时: ${Date.now() - extractStartTime}ms`);
  // 如果没有找到任何代码，返回null
  return null;
}

