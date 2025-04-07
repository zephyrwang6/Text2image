"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextToImageConverter from "@/components/text-to-image-converter"
import TemplateCarousel from "@/components/template-carousel"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"cover" | "card" | "diagram">("cover")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const handleTemplateSelect = (templateId: string, templateName: string) => {
    setSelectedTemplate(templateId)
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-primary mb-4">文图图</h1>
        <p className="text-lg text-muted-foreground text-center mb-10 max-w-2xl">
          将文字转换为精美图片，支持封面图、文字卡和逻辑图等多种样式
        </p>

        <div className="w-full max-w-4xl">
          <Tabs defaultValue="cover" onValueChange={(value) => setActiveTab(value as "cover" | "card" | "diagram")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cover">封面图</TabsTrigger>
              <TabsTrigger value="card">文字卡</TabsTrigger>
              <TabsTrigger value="diagram">逻辑图</TabsTrigger>
            </TabsList>
            <TabsContent value="cover">
              <TextToImageConverter type="cover" selectedTemplate={selectedTemplate} />
            </TabsContent>
            <TabsContent value="card">
              <TextToImageConverter type="card" selectedTemplate={selectedTemplate} />
            </TabsContent>
            <TabsContent value="diagram">
              <TextToImageConverter type="diagram" selectedTemplate={selectedTemplate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

