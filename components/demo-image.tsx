"use client"

import { useEffect, useRef, useState } from "react"

interface DemoImageProps {
  src: string
  alt: string
}

export function DemoImage({ src, alt }: DemoImageProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    // 使用 Intersection Observer 来精确控制图片加载
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // 只有当图片真正进入视口时才加载
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
            break
          }
        }
      },
      {
        // 设置 rootMargin 为 0，确保只有进入视口才加载
        rootMargin: "0px",
        threshold: 0.01,
      }
    )

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? (src || "/placeholder.svg") : undefined}
      alt={alt}
      className="w-full h-auto"
      decoding="async"
    />
  )
}

