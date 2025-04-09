import { NextResponse } from "next/server"
import { getTemplateById } from "@/lib/templates"

export async function POST(request: Request) {
  try {
    console.log(`[${new Date().toISOString()}] 收到生成请求`);
    const startTime = Date.now();
    const { text, templateId, type, language } = await request.json()
    const useStream = true; // 设置为false可以切换到非流式响应模式

    // Validate input
    if (!text || !templateId || !type) {
      console.error(`[${new Date().toISOString()}] 请求参数缺失`);
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the template
    const template = getTemplateById(templateId)
    if (!template) {
      console.error(`[${new Date().toISOString()}] 找不到模板: ${templateId}`);
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      )
    }

    // Validate API key
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error(`[${new Date().toISOString()}] DeepSeek API key未配置`);
      return NextResponse.json(
        { success: false, error: "API configuration error" },
        { status: 500 }
      )
    }

    // Get the prompt based on language
    const prompt = language === "zh" ? template.promptZh : template.promptEn

    // Log the request
    console.log(`[${new Date().toISOString()}] DeepSeek API 请求开始:`, {
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
    console.log(`[${new Date().toISOString()}] 正在调用DeepSeek API...`);
    const apiCallStartTime = Date.now();
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: useStream,
        // 添加最大tokens限制以控制生成长度
        max_tokens: 2000,
      }),
    });
    const apiCallDuration = Date.now() - apiCallStartTime;
    
    console.log(`[${new Date().toISOString()}] DeepSeek API 响应状态: ${response.status}, 用时: ${apiCallDuration}ms`);

    if (!response.ok) {
      let errorMessage = `API 返回错误状态码: ${response.status}`;
      let errorData;
      
      try {
        errorData = await response.json();
        console.error("DeepSeek API 错误详情:", errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error("无法解析 API 错误响应:", e);
      }
      
      return NextResponse.json(
        {
          success: false,
          error: "AI 内容生成失败",
          details: errorData || errorMessage,
        },
        { status: response.status }
      );
    }

    // 检查响应的内容类型
    const contentType = response.headers.get('Content-Type');
    console.log("DeepSeek API 响应内容类型:", contentType);

    // 如果使用非流式响应
    if (!useStream) {
      try {
        const data = await response.json();
        console.log("非流式响应结果:", data.choices?.[0]?.message?.content ? "有内容" : "无内容");
        
        return NextResponse.json({
          success: true,
          content: data.choices?.[0]?.message?.content,
          tokenUsage: data.usage || {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          }
        });
      } catch (e) {
        console.error("解析非流式响应失败:", e);
        return NextResponse.json(
          { success: false, error: "解析API响应失败" },
          { status: 500 }
        );
      }
    }

    // 对于流式响应，我们需要包装原始响应，加入token计数
    const originalStream = response.body;
    if (!originalStream) {
      console.error("API响应没有可读流");
      return NextResponse.json(
        { success: false, error: "API响应格式错误" },
        { status: 500 }
      );
    }

    // 创建一个TransformStream对象，用于转换原始流数据
    const { readable, writable } = new TransformStream();
    const reader = originalStream.getReader();
    const writer = writable.getWriter();
    
    // 异步处理流
    (async () => {
      let accumulatedTokens = 0;
      const textDecoder = new TextDecoder();
      const textEncoder = new TextEncoder();
      let chunkCounter = 0;
      const streamStartTime = Date.now();
      
      console.log(`[${new Date().toISOString()}] 开始处理API流式响应`);
      
      try {
        // 创建一个定时器监控每30秒记录一次状态
        const monitorInterval = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - streamStartTime) / 1000);
          console.log(`[${new Date().toISOString()}] 流处理状态监控: 已运行${elapsedTime}秒，接收${chunkCounter}个数据块，累计令牌数${accumulatedTokens}`);
        }, 30000);
        
        while (true) {
          const chunkStartTime = Date.now();
          const { done, value } = await reader.read();
          const readTime = Date.now() - chunkStartTime;
          
          if (done) {
            console.log(`[${new Date().toISOString()}] API流结束，总运行时间: ${Math.floor((Date.now() - streamStartTime) / 1000)}秒，总数据块: ${chunkCounter}`);
            clearInterval(monitorInterval);
            
            // 流结束，添加完成标记
            const completionMsg = `data: {"finish_reason":"stop","choices":[{"finish_reason":"stop"}]}\n\n`;
            await writer.write(textEncoder.encode(completionMsg));
            
            // 添加标准的完成标记
            const doneMsg = 'data: [DONE]\n\n';
            await writer.write(textEncoder.encode(doneMsg));
            
            // 关闭流
            await writer.close();
            console.log(`[${new Date().toISOString()}] 成功关闭流，总处理时间: ${Math.floor((Date.now() - startTime) / 1000)}秒`);
            break;
          }
          
          // 解码数据
          const chunkText = textDecoder.decode(value, { stream: true });
          chunkCounter++;
          
          console.log(`[${new Date().toISOString()}] 收到数据块 #${chunkCounter}: 大小 ${value.length} 字节，读取耗时 ${readTime}ms`);
          
          // 将数据写入新流
          await writer.write(value);
          
          // 简单估算token数量（4个字符约1个token）并注入计数信息
          // 只有当我们可以确定这是一个正常的事件块时才计算
          if (chunkText.includes('content')) {
            const contentMatch = chunkText.match(/"content"\s*:\s*"([^"]*)"/);
            if (contentMatch && contentMatch[1]) {
              const content = contentMatch[1];
              const newTokens = Math.ceil(content.length / 4);
              accumulatedTokens += newTokens;
              
              // 注入token计数信息
              const tokenInfo = `data: {"usage":{"total_tokens":${accumulatedTokens}}}\n\n`;
              await writer.write(textEncoder.encode(tokenInfo));
            }
          }
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] 流处理错误:`, error);
        // 尝试写入错误信息
        try {
          const errorMsg = `data: {"error": "Stream processing error"}\n\n`;
          await writer.write(textEncoder.encode(errorMsg));
          await writer.close();
        } catch (e) {
          console.error(`[${new Date().toISOString()}] 无法写入错误信息:`, e);
        }
      }
    })().catch(error => {
      console.error(`[${new Date().toISOString()}] 流处理过程中发生错误:`, error);
    });

    // 将转换后的流返回给客户端
    console.log(`[${new Date().toISOString()}] 返回流给客户端，API处理总时间: ${Date.now() - startTime}ms`);
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
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

