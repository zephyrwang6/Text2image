import Image from "next/image"
import { Card } from "@/components/ui/card"

interface ImagePreviewProps {
  src: string
  alt: string
}

export default function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <Card className="overflow-hidden p-0 max-w-md">
      <div className="relative aspect-[3/4] w-full max-w-[300px]">
        <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-cover" />
      </div>
    </Card>
  )
}

