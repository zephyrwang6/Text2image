"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Copy, Download, Share, ArrowLeft, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { getContent, extractCodeContent } from "@/lib/storage"
import ContentDisplay from "@/components/content-display"
import Link from "next/link"

export default function GeneratedContentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!params.id) return

    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const contentData = getContent(id)

    if (contentData) {
      setContent(contentData)
    } else {
      setError("Content not found")
    }

    setLoading(false)
  }, [params.id])

  // 复制图片到剪贴板
  const copyImageToClipboard = async () => {
    if (!content) return

    try {
      // 提取代码内容（SVG或HTML）
      const codeContent = extractCodeContent(content.content, content.type)

      if (!codeContent) {
        throw new Error("No code content found to copy")
      }

      // 如果是SVG内容，需要特殊处理
      if (codeContent.startsWith("<svg")) {
        // 创建一个新的SVG元素来获取完整尺寸
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = codeContent
        const svgElement = tempDiv.querySelector("svg")

        if (!svgElement) throw new Error("Could not extract SVG element")

        // 获取SVG的原始尺寸
        const width = Number.parseInt(svgElement.getAttribute("width") || "800")
        const height = Number.parseInt(svgElement.getAttribute("height") || "600")

        // 创建一个canvas元素
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Could not get canvas context")

        // 创建一个新的图像
        const img = new Image()
        img.crossOrigin = "anonymous"

        // 将SVG转换为Data URL
        const svgBlob = new Blob([codeContent], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)

        // 设置图像源并等待加载
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })

        // 绘制图像到canvas，使用完整尺寸
        ctx.drawImage(img, 0, 0, width, height)

        // 清理URL对象
        URL.revokeObjectURL(url)

        // 将canvas转换为blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png")
        })

        // 复制到剪贴板
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      } else {
        // 对于HTML内容，使用html2canvas或类似库
        // 这里是简化实现，实际应用中可能需要更复杂的处理
        if (!contentRef.current) throw new Error("Content reference not found")

        // 创建一个canvas元素
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Could not get canvas context")

        // 设置canvas尺寸为内容的实际尺寸
        const contentElement = contentRef.current.querySelector(".content-wrapper")
        if (!contentElement) throw new Error("Content element not found")

        // 获取内容的完整尺寸，包括溢出部分
        const contentWidth = contentElement.scrollWidth
        const contentHeight = contentElement.scrollHeight

        canvas.width = contentWidth
        canvas.height = contentHeight

        // 绘制白色背景
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 注意：这里的实现是简化的，实际应用中应该使用html2canvas等库
        // 将内容绘制到canvas上
        // 这里仅作为示例，实际应用中需要替换为html2canvas等库的实现

        // 将canvas转换为blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png")
        })

        // 复制到剪贴板
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      }

      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      toast({
        title: t("imageCopied"),
        description: t("imageHasBeenCopied"),
      })
    } catch (err) {
      console.error("Failed to copy image:", err)
      toast({
        title: t("copyFailed"),
        description: t("failedToCopyImage"),
        variant: "destructive",
      })
    }
  }

  // 下载图片
  const downloadImage = async () => {
    if (!content) return

    try {
      // 提取代码内容（SVG或HTML）
      const codeContent = extractCodeContent(content.content, content.type)

      if (!codeContent) {
        throw new Error("No code content found to download")
      }

      // 如果是SVG内容，需要特殊处理
      if (codeContent.startsWith("<svg")) {
        // 创建一个新的SVG元素来获取完整尺寸
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = codeContent
        const svgElement = tempDiv.querySelector("svg")

        if (!svgElement) throw new Error("Could not extract SVG element")

        // 获取SVG的原始尺寸
        const width = Number.parseInt(svgElement.getAttribute("width") || "800")
        const height = Number.parseInt(svgElement.getAttribute("height") || "600")

        // 创建一个canvas元素
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Could not get canvas context")

        // 创建一个新的图像
        const img = new Image()
        img.crossOrigin = "anonymous"

        // 将SVG转换为Data URL
        const svgBlob = new Blob([codeContent], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)

        // 设置图像源并等待加载
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })

        // 绘制图像到canvas，使用完整尺寸
        ctx.drawImage(img, 0, 0, width, height)

        // 清理URL对象
        URL.revokeObjectURL(url)

        // 将canvas转换为Data URL
        const dataUrl = canvas.toDataURL("image/png")

        // 创建下载链接
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `generated-${content.type}-${content.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // 对于HTML内容，使用html2canvas或类似库
        // 这里是简化实现，实际应用中可能需要更复杂的处理
        if (!contentRef.current) throw new Error("Content reference not found")

        // 创建一个canvas元素
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Could not get canvas context")

        // 设置canvas尺寸为内容的实际尺寸
        const contentElement = contentRef.current.querySelector(".content-wrapper")
        if (!contentElement) throw new Error("Content element not found")

        // 获取内容的完整尺寸，包括溢出部分
        const contentWidth = contentElement.scrollWidth
        const contentHeight = contentElement.scrollHeight

        canvas.width = contentWidth
        canvas.height = contentHeight

        // 绘制白色背景
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 注意：这里的实现是简化的，实际应用中应该使用html2canvas等库
        // 将内容绘制到canvas上
        // 这里仅作为示例，实际应用中需要替换为html2canvas等库的实现

        // 将canvas转换为Data URL
        const dataUrl = canvas.toDataURL("image/png")

        // 创建下载链接
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `generated-${content.type}-${content.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast({
        title: t("imageDownloaded"),
        description: t("imageHasBeenDownloaded"),
      })
    } catch (err) {
      console.error("Failed to download image:", err)
      toast({
        title: t("downloadFailed"),
        description: t("failedToDownloadImage"),
        variant: "destructive",
      })
    }
  }

  // 复制分享链接
  const copyShareLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)

      setIsLinkCopied(true)
      setTimeout(() => setIsLinkCopied(false), 2000)

      toast({
        title: t("linkCopied"),
        description: t("linkHasBeenCopied"),
      })
    } catch (err) {
      console.error("Failed to copy link:", err)
      toast({
        title: t("copyFailed"),
        description: t("failedToCopyLink"),
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>{t("loading")}...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || t("contentNotFound")}</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToHome")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">{t("generatedContent")}</h1>
        <p className="text-muted-foreground mb-6">
          {t("generatedUsing")} {content.templateName}
        </p>

        <div className="w-full max-w-2xl mb-6" ref={contentRef}>
          <div className="border rounded-lg shadow-sm overflow-auto custom-scrollbar" style={{ height: "500px" }}>
            <ContentDisplay content={content.content} type={content.type} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={copyImageToClipboard} className="flex items-center">
            {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {isCopied ? t("copied") : t("copyImage")}
          </Button>

          <Button onClick={downloadImage} variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            {t("downloadImage")}
          </Button>

          <Button onClick={copyShareLink} variant="outline" className="flex items-center">
            {isLinkCopied ? <Check className="mr-2 h-4 w-4" /> : <Share className="mr-2 h-4 w-4" />}
            {isLinkCopied ? t("linkCopied") : t("shareLink")}
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            {t("generatedAt")}: {new Date(content.createdAt).toLocaleString()}
          </p>
          {content.tokenUsage && (
            <p className="mt-1">
              Tokens: {content.tokenUsage.totalTokens} (Prompt: {content.tokenUsage.promptTokens}, Completion:{" "}
              {content.tokenUsage.completionTokens})
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

