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
        stream: true,
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

    // 将流式响应直接传递给客户端
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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

