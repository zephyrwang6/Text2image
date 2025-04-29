"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextToImageConverter from "@/components/text-to-image-converter"
import TemplateCarousel from "@/components/template-carousel"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"cover" | "card" | "diagram">("cover")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [sharedText, setSharedText] = useState("")

  const handleTemplateSelect = (templateId: string, templateName: string) => {
    setSelectedTemplate(templateId)
  }

  // 处理类型切换
  const handleTypeChange = (newType: "cover" | "card" | "diagram") => {
    setActiveTab(newType)
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-primary mb-4">文图图</h1>
        <p className="text-lg text-muted-foreground text-center mb-6 max-w-2xl">
          将文字转换为精美卡片
        </p>

        <div className="w-full max-w-4xl">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "cover" | "card" | "diagram")}>
            <div className="flex justify-center">
              <TabsList className="grid w-1/2 grid-cols-3">
                <TabsTrigger value="cover">封面图</TabsTrigger>
                <TabsTrigger value="card">文字卡</TabsTrigger>
                <TabsTrigger value="diagram">逻辑图</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="cover">
              <TextToImageConverter 
                type="cover" 
                selectedTemplate={selectedTemplate} 
                sharedText={sharedText} 
                setSharedText={setSharedText} 
                onTypeChange={handleTypeChange}
              />
            </TabsContent>
            <TabsContent value="card">
              <TextToImageConverter 
                type="card" 
                selectedTemplate={selectedTemplate} 
                sharedText={sharedText} 
                setSharedText={setSharedText} 
                onTypeChange={handleTypeChange}
              />
            </TabsContent>
            <TabsContent value="diagram">
              <TextToImageConverter 
                type="diagram" 
                selectedTemplate={selectedTemplate} 
                sharedText={sharedText} 
                setSharedText={setSharedText} 
                onTypeChange={handleTypeChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
