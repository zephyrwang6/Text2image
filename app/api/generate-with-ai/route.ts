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

    // 设置请求参数
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: true, // 仍然保持流式获取以获得更好的响应时间
      }),
    };

    // 调用DeepSeek API
    const response = await fetch("https://api.deepseek.com/chat/completions", requestOptions);

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

    // 如果是在Vercel生产环境中，使用完整缓冲而不是直接流式传输
    if (process.env.VERCEL === '1') {
      try {
        // 读取完整的流
        const reader = response.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        let completeContent = "";
        let usageInfo = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split('\n\n').filter(Boolean);
          
          for (const event of events) {
            if (event === 'data: [DONE]') continue;
            if (event.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(event.slice(5));
                if (jsonData.choices?.[0]?.delta?.content) {
                  completeContent += jsonData.choices[0].delta.content;
                }
                if (jsonData.usage) {
                  usageInfo = jsonData.usage;
                }
              } catch (e) {
                console.error("Error parsing streaming response:", e);
              }
            }
          }
        }

        // 完整内容收集完成，返回非流式响应
        console.log("完整内容收集完成，长度:", completeContent.length);
        return NextResponse.json({
          success: true,
          content: completeContent,
          tokenUsage: usageInfo ? {
            promptTokens: usageInfo.prompt_tokens || 0,
            completionTokens: usageInfo.completion_tokens || 0,
            totalTokens: usageInfo.total_tokens || 0
          } : undefined
        });
      } catch (error) {
        console.error("Error processing stream in Vercel environment:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Error processing stream response",
            details: error instanceof Error ? error.message : "Unknown streaming error",
          },
          { status: 500 }
        );
      }
    } else {
      // 开发环境下使用直接流式传输
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
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

