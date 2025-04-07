"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import ContentDisplay from "@/components/content-display"
import { Image } from "lucide-react"

interface RecentGenerationsProps {
  recentGenerations: any[]
  noRecentText: string
}

export default function RecentGenerations({ recentGenerations, noRecentText }: RecentGenerationsProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {recentGenerations.length > 0
        ? recentGenerations.map((item) => (
            <Card
              key={item.id}
              className="aspect-[4/3] cursor-pointer hover:shadow-md overflow-hidden rounded-xl border"
              onClick={() => router.push(`/${item.id}`)}
            >
              <div className="h-full w-full p-3 flex flex-col">
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <ContentDisplay content={item.content} type={item.type} />
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground truncate">
                  {new Date(item.createdAt).toLocaleDateString()} - {item.templateName}
                </div>
              </div>
            </Card>
          ))
        : Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center text-muted-foreground border"
            >
              <div className="text-center p-4">
                <Image className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                {noRecentText}
              </div>
            </div>
          ))}
    </div>
  )
}

