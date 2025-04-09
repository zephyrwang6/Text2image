"use client"

import { useState, useEffect } from "react"
import { extractCodeContent } from "@/lib/storage"

interface ContentDisplayProps {
  content: string
  type: "cover" | "card" | "diagram"
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const [renderedContent, setRenderedContent] = useState<string>("")

  useEffect(() => {
    // 提取代码内容（SVG或HTML）
    const codeContent = extractCodeContent(content, type)

    if (codeContent) {
      setRenderedContent(codeContent)
    } else {
      // 如果没有找到代码内容，显示一个简单的消息
      setRenderedContent(`<div class="flex items-center justify-center h-full">
        <p class="text-muted-foreground">No HTML or SVG content found</p>
      </div>`)
    }
  }, [content, type])

  return (
    <div
      className="content-wrapper"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  )
}
