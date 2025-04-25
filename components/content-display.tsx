"use client"

import { useState, useEffect } from "react"
import { extractCodeContent } from "@/lib/storage"

interface ContentDisplayProps {
  content: string
  type: "cover" | "card" | "diagram"
  debug?: boolean
}

export default function ContentDisplay({ content, type, debug = false }: ContentDisplayProps) {
  const [renderedContent, setRenderedContent] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    try {
      console.log("Original content length:", content.length);
      console.log("Content preview:", content.substring(0, 100) + "...");
      
      // 检查内容是否包含markdown代码块
      const hasMdCodeBlock = content.includes("```");
      console.log("Contains markdown code block:", hasMdCodeBlock);
      
      // 提取代码内容（SVG或HTML）
      let codeContent = extractCodeContent(content, type)
      
      console.log("Extracted content:", codeContent ? 
                 `Successfully extracted (${codeContent.length} chars)` : "Failed to extract");
      
      if (codeContent) {
        // 为SVG添加响应式支持
        if (codeContent.startsWith("<svg")) {
          // 移除原始宽度和高度，添加viewBox（如果没有）
          const svgElement = document.createElement("div");
          svgElement.innerHTML = codeContent;
          const svg = svgElement.querySelector("svg");
          
          if (svg) {
            // 获取原始尺寸
            const width = svg.getAttribute("width") || "800";
            const height = svg.getAttribute("height") || "600";
            
            // 如果没有viewBox，添加一个
            if (!svg.hasAttribute("viewBox")) {
              svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
            }
            
            // 为SVG设置白色背景
            if (!svg.hasAttribute("style") || !svg.getAttribute("style")?.includes("background")) {
              const existingStyle = svg.getAttribute("style") || "";
              svg.setAttribute("style", `${existingStyle} background-color: white;`);
            }
            
            // 移除固定宽高，使用响应式CSS类
            svg.removeAttribute("width");
            svg.removeAttribute("height");
            svg.setAttribute("class", (svg.getAttribute("class") || "") + " w-full h-auto max-w-full");
            // 确保SVG保持其原始比例，不设置高度限制
            svg.setAttribute("style", "width: 100%; height: auto; display: block; margin: 0 auto; background-color: white;");
            
            codeContent = svgElement.innerHTML;
          }
        } 
        // 为HTML内容添加响应式样式
        else if (codeContent.includes("<html") || codeContent.includes("<body") || codeContent.includes("<div")) {
          // 为HTML内容添加响应式样式，不添加额外的包装div
          if (!codeContent.includes("style=")) {
            codeContent = codeContent.replace(/<(div|body|html)([^>]*)>/i, 
              '<$1$2 style="width: 100%; height: auto; display: block; margin: 0 auto; padding: 0; background-color: white;">');
          } else if (!codeContent.includes("background-color")) {
            // 如果已经有style但没有背景色
            codeContent = codeContent.replace(/style="([^"]*)"/i, 
              'style="$1; background-color: white;"');
          }
        }
        
        setRenderedContent(codeContent)
        if (debug) {
          setDebugInfo({
            originalLength: content.length,
            extractedLength: codeContent.length,
            hasMdCodeBlock,
            contentType: codeContent.startsWith("<svg") ? "SVG" : 
                        codeContent.includes("<html") ? "HTML" : 
                        codeContent.includes("<body") ? "HTML (body)" : 
                        codeContent.includes("<div") ? "HTML (div)" : "Unknown"
          });
        }
      } else {
        // 如果没有找到代码内容，显示一个简单的消息
        console.error("No HTML or SVG content found in:", content.substring(0, 200));
        setError("无法提取有效的内容。请检查生成的内容格式。");
        setRenderedContent(`<div class="flex items-center justify-center h-full">
          <p class="text-muted-foreground">无法展示内容：未找到有效的SVG或HTML代码</p>
        </div>`)
      }
    } catch (err) {
      console.error("Error rendering content:", err);
      setError(`渲染错误: ${err instanceof Error ? err.message : '未知错误'}`);
      setRenderedContent(`<div class="flex items-center justify-center h-full text-destructive">
        <p>内容渲染出错</p>
      </div>`)
    }
  }, [content, type, debug])

  return (
    <>
      <div
        className="content-wrapper w-full h-auto flex items-center justify-center bg-white"
        style={{ margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}
      {debug && debugInfo && (
        <div className="mt-4 p-4 bg-muted rounded-md text-xs font-mono">
          <h4 className="font-bold mb-2">调试信息</h4>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </>
  )
}
