import type {
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateAIContentRequest,
  GenerateAIContentResponse,
} from "./types"

export async function generateImage(data: GenerateImageRequest): Promise<GenerateImageResponse> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate image")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in generateImage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function generateAIContent(data: GenerateAIContentRequest): Promise<GenerateAIContentResponse> {
  try {
    const response = await fetch("/api/generate-with-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate content with AI")
    }

    // 检查是否是流式响应
    const contentType = response.headers.get('Content-Type')
    if (contentType && contentType.includes('text/event-stream')) {
      // 返回 response 对象供调用者处理流
      return {
        success: true,
        stream: response.body,
      }
    }

    // 非流式响应的处理保持不变
    return await response.json()
  } catch (error) {
    console.error("Error in generateAIContent:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getTemplates(type: "cover" | "card" | "diagram") {
  try {
    const response = await fetch(`/api/templates?type=${type}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch templates")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getTemplates:", error)
    throw error
  }
}

export async function getRecentGenerations(limit = 4) {
  try {
    const response = await fetch(`/api/generations/recent?limit=${limit}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch recent generations")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getRecentGenerations:", error)
    throw error
  }
}

