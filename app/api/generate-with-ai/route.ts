import { NextResponse } from "next/server"
import { getTemplateById } from "@/lib/templates"

export async function POST(request: Request) {
  try {
    const { text, templateId, type, language } = await request.json()

    // Validate input
    if (!text || !templateId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the template
    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Get the prompt based on language
    const prompt = language === "zh" ? template.promptZh : template.promptEn

    // Log the request (in development only)
    if (process.env.NODE_ENV === "development") {
      console.log("DeepSeek API Request:", {
        templateId,
        type,
        language,
        promptLength: prompt.length,
        textLength: text.length,
      })
    }

    // Prepare the message for DeepSeek API
    const messages = [
      { role: "system", content: prompt }, // 模板提示词作为系统消息
      { role: "user", content: text }, // 用户输入作为用户消息
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
          error: "Failed to generate content with AI",
          details: errorData,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    // Calculate token usage
    const promptTokens = data.usage?.prompt_tokens || 0
    const completionTokens = data.usage?.completion_tokens || 0
    const totalTokens = data.usage?.total_tokens || 0

    // Log the response (in development only)
    if (process.env.NODE_ENV === "development") {
      console.log("DeepSeek API Response:", {
        status: response.status,
        contentLength: data.choices?.[0]?.message?.content?.length || 0,
        tokenUsage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
      })
    }

    // Record metadata about the generation
    const generationMetadata = {
      id: `gen_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      creatorIp: request.headers.get("x-forwarded-for") || "unknown",
      templateId,
      templateType: type,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      // In a real implementation, you would store this in a database
    }

    // Return the AI-generated content
    return NextResponse.json({
      success: true,
      content: data.choices[0].message.content,
      metadata: generationMetadata,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
    })
  } catch (error) {
    console.error("Error generating content:", error)
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

