import { NextResponse } from "next/server"
import { getTemplateById } from "@/lib/templates"

export async function POST(request: Request) {
  try {
    const { text, templateId, type, language } = await request.json()

    // Validate input
    if (!text || !templateId || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the template
    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      )
    }

    // Validate API key
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("DeepSeek API key is not configured")
      return NextResponse.json(
        { success: false, error: "API configuration error" },
        { status: 500 }
      )
    }

    // Get the prompt based on language
    const prompt = language === "zh" ? template.promptZh : template.promptEn

    // Log the request
    console.log("DeepSeek API Request:", {
      templateId,
      type,
      language,
      promptLength: prompt.length,
      textLength: text.length,
    })

    // Prepare the message for DeepSeek API
    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: text },
    ]

    // Call DeepSeek API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("DeepSeek API error:", errorData)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate content with AI",
          details: errorData,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Validate response data
    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid response format from DeepSeek API:", data)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response format from AI service",
        },
        { status: 500 }
      )
    }

    // Calculate token usage
    const promptTokens = data.usage?.prompt_tokens || 0
    const completionTokens = data.usage?.completion_tokens || 0
    const totalTokens = data.usage?.total_tokens || 0

    // Log the response
    console.log("DeepSeek API Response:", {
      status: response.status,
      contentLength: data.choices[0].message.content.length,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
    })

    // Return the AI-generated content
    return NextResponse.json({
      success: true,
      content: data.choices[0].message.content,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
    })
  } catch (error) {
    console.error("Error in generate-with-ai route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

