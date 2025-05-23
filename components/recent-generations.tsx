"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import ContentDisplay from "@/components/content-display"
import { Image } from "lucide-react"

interface RecentGenerationsProps {
  recentGenerations: any[]
  noRecentText: string
}

// 格式化日期为"13:32 4/28"格式
function formatDate(dateString: string) {
  const date = new Date(dateString);
  
  // 获取小时和分钟，确保是两位数
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // 获取月份和日期
  const month = date.getMonth() + 1; // 月份从0开始
  const day = date.getDate();
  
  return `${hours}:${minutes} ${month}/${day}`;
}

export default function RecentGenerations({ recentGenerations, noRecentText }: RecentGenerationsProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {recentGenerations.length > 0
        ? recentGenerations.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer overflow-hidden rounded-xl bg-background"
              onClick={() => router.push(`/${item.id}`)}
            >
              <div className="flex flex-col">
                <div 
                  className="overflow-auto custom-scrollbar"
                >
                  <ContentDisplay content={item.content} type={item.type} />
                </div>
                <div className="mt-2 text-sm text-left text-muted-foreground truncate px-2 pb-2">
                  {formatDate(item.createdAt)} - {item.templateName}
                </div>
              </div>
            </div>
          ))
        : Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted rounded-xl flex items-center justify-center text-muted-foreground"
            >
              <div className="text-center p-4">
                <Image className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                {noRecentText}
              </div>
            </div>
          ))}
    </div>
  )
}
