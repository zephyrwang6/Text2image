import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextToImageConverter from "@/components/text-to-image-converter"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "文 To 图 | Text to Image Converter",
  description: "将文字转换为精美图片 | Convert your text into beautiful images",
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 text-primary">文 To 图</h1>
        <p className="text-lg text-muted-foreground text-center mb-10 max-w-2xl">
          将文字转换为精美图片，支持封面图、文字卡和逻辑图等多种样式
        </p>

        <div className="w-full max-w-3xl space-y-8">
          <div className="bg-transparent backdrop-blur-sm rounded-xl">
            <Tabs defaultValue="cover" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8 p-1 bg-muted rounded-lg">
                <TabsTrigger
                  value="cover"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary"
                >
                  封面图
                </TabsTrigger>
                <TabsTrigger
                  value="card"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary"
                >
                  文字卡
                </TabsTrigger>
                <TabsTrigger
                  value="diagram"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary"
                >
                  逻辑图
                </TabsTrigger>
              </TabsList>

              <div className="flex justify-center w-full">
                <TabsContent value="cover" className="w-full">
                  <TextToImageConverter type="cover" description="将文本精简化，适用于为长内容设计小红书、公众号封面" />
                </TabsContent>

                <TabsContent value="card" className="w-full">
                  <TextToImageConverter
                    type="card"
                    description="提取文本关系，并生成配图，适用于PPT或文章配图文字卡：不改变文本内容，生成文字卡片，适用于书摘或笔记卡片"
                  />
                </TabsContent>

                <TabsContent value="diagram" className="w-full">
                  <TextToImageConverter type="diagram" description="提取文本关系，并生成配图，适用于PPT或文章配图" />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}

