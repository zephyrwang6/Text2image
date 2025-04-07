// Template types
export interface Template {
  id: string
  name: string
  nameEn: string
  type: "cover" | "card" | "diagram"
  description: string
  descriptionEn: string
  promptZh: string
  promptEn: string
  color: string
  previewImage?: string
}

// Generated content types
export interface GeneratedContent {
  id: string
  generatedAt: string
  creatorIp: string
  templateId: string
  templateType: "cover" | "card" | "diagram"
  imageUrl?: string
  content?: string
  text: string
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// API request types
export interface GenerateImageRequest {
  text: string
  templateId: string
  type: "cover" | "card" | "diagram"
  language: "zh" | "en"
}

export interface GenerateImageResponse {
  success: boolean
  imageUrl?: string
  svgContent?: string
  htmlContent?: string
  metadata?: {
    id: string
    generatedAt: string
    templateId: string
    templateType: "cover" | "card" | "diagram"
  }
  error?: string
}

export interface GenerateAIContentRequest {
  text: string
  templateId: string
  type: "cover" | "card" | "diagram"
  language: "zh" | "en"
}

export interface GenerateAIContentResponse {
  success: boolean
  content?: string
  metadata?: {
    id: string
    generatedAt: string
    templateId: string
    templateType: "cover" | "card" | "diagram"
    tokenUsage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

