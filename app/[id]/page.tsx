"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Copy, Download, Share, ArrowLeft, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { getContent, extractCodeContent } from "@/lib/storage"
import ContentDisplay from "@/components/content-display"
import Link from "next/link"
import * as domtoimage from "dom-to-image"

// 修复类型错误
declare module 'dom-to-image' {
  export function toBlob(node: HTMLElement, options?: any): Promise<Blob>;
  export function toPng(node: HTMLElement, options?: any): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: any): Promise<string>;
  export function toSvg(node: HTMLElement, options?: any): Promise<string>;
}

export default function GeneratedContentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const debug = searchParams.get('debug') === 'true'
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
          canvas.toBlob((b: Blob | null) => resolve(b!), "image/png")
        })

        // 复制到剪贴板
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      } else {
        // 对于HTML内容，使用dom-to-image
        if (!contentRef.current) throw new Error("Content reference not found")

        // 获取内容元素
        const contentElement = contentRef.current.querySelector(".content-wrapper")
        if (!contentElement || !(contentElement instanceof HTMLElement)) {
          throw new Error("Content element not found")
        }

        // 使用dom-to-image将内容转换为图片
        const blob = await domtoimage.toBlob(contentElement, {
          quality: 1,
          bgcolor: null,
          style: {
            backgroundColor: "transparent"
          }
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

      // 对于SVG内容，直接下载SVG文件
      if (codeContent.startsWith("<svg")) {
        // 创建SVG Blob
        const blob = new Blob([codeContent], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        
        // 创建下载链接
        const link = document.createElement("a")
        link.href = url
        link.download = `generated-${content.type}-${content.id}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100)
        
        toast({
          title: "下载成功",
          description: "SVG图片已下载",
        })
      } else {
        // 对于HTML内容，使用简单的方法
        // 创建下载链接
        const blob = new Blob([codeContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement("a")
        link.href = url
        link.download = `generated-${content.type}-${content.id}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100)
        
        toast({
          title: "下载成功",
          description: "HTML内容已下载",
        })
      }
    } catch (err) {
      console.error("Failed to download:", err)
      toast({
        title: "下载失败",
        description: "无法下载内容，请重试",
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>{t("loading")}...</p>
        </div>
      ) : error || !content ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || t("contentNotFound")}</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("backToHome")}
                </Link>
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyImageToClipboard}
                  disabled={isCopied}
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {t("copyImage")}
                    </>
                  )}
                </Button>
                
                <Button variant="outline" size="sm" onClick={downloadImage}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("download")}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareLink}
                  disabled={isLinkCopied}
                >
                  {isLinkCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Share className="mr-2 h-4 w-4" />
                      {t("share")}
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div
              ref={contentRef}
              className="mb-6 border p-4 rounded-lg shadow-inner bg-white"
              style={{ minHeight: "400px" }}
            >
              <ContentDisplay content={content.content} type={content.type} debug={debug} />
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              <p>
                {t("generatedAt")}: {new Date(content.createdAt).toLocaleString()}
              </p>
              <p>
                {t("template")}: {content.templateName}
              </p>
              {content.tokenUsage && (
                <p>
                  {t("tokens")}:{" "}
                  {content.tokenUsage.totalTokens.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
