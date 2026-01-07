import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { FileText, MessageSquare, Code, Sparkles, ArrowRight, CheckCircle2, BookIcon } from "lucide-react"
import { HeaderUserNav } from "@/components/header-user-nav"
import { DemoImage } from "@/components/demo-image"

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: "简历优化",
      description: "专业的简历分析和优化建议，帮你打造脱颖而出的简历",
    },
    {
      icon: MessageSquare,
      title: "模拟面试",
      description: "真实的面试场景模拟，提供即时反馈和改进建议",
    },
    {
      icon: Code,
      title: "面试题解答",
      description: "涵盖前端、算法、系统设计等各类编程面试题详解",
    },
  ]

  const highlights = ["专注前端开发领域", "基于最新技术栈", "AI 智能分析", "即时反馈建议"]

  const demos = [
    {
      title: "简历智能分析",
      description: "上传简历，AI 自动分析并提供优化建议",
      image: "/images/1-resume-opt.gif",
    },
    {
      title: "模拟面试场景",
      description: "真实面试对话，实时反馈和评分",
      image: "/images/2-mock-interview.gif",
    },
    {
      title: "面试题详解",
      description: "前端经典面试题目，详细解答和思路分析",
      image: "/images/3-q-a.gif",
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="size-8 rounded-lg flex items-center justify-center">
              <Sparkles className="size-5 text-blue-600" />
            </div> */}
            <span className="font-semibold text-lg text-blue-600">ZhiTalk 智语</span>
          </div>
          <HeaderUserNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm border border-border">
            <Sparkles className="size-4" />
            <span>由 AI 驱动的智能面试助手</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            你的专属
            <span className="text-blue-600"> AI Agent</span> 面试官
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            专注编程领域，尤其前端开发。提供简历优化、模拟面试、面试题解答等全方位面试辅导服务
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/chat">
              <Button size="lg" className="w-full sm:w-auto cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
                立即开始
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="https://www.huashuiai.com/pub/ai-agent-camp">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent cursor-pointer">
                学习该项目
                <BookIcon className="ml-2 size-4" />
              </Button>
            </Link>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-8">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">核心功能</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">全方位的面试准备解决方案</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="p-6 space-y-4 hover:border-primary transition-colors">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="size-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Demo Section - GIF 展示区域 */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-muted/30">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">功能演示</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            看看 AI 面试官如何帮助你准备面试
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {demos.map((demo, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden border-2">
                    <div className="bg-muted flex items-center justify-center relative overflow-hidden">
                      <DemoImage src={demo.image} alt={demo.title} />
                    </div>
                    <div className="p-6 space-y-2">
                      <h3 className="text-2xl font-semibold">{demo.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{demo.description}</p>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-12 md:-left-16" />
            <CarouselNext className="-right-12 md:-right-16" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center space-y-6 bg-primary text-primary-foreground border-0">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">准备好开始你的面试准备了吗？</h2>
          <p className="text-lg text-primary-foreground/90 text-balance max-w-2xl mx-auto">
            立即与 AI 面试官对话，获取专业的面试指导和建议
          </p>
          <div className="pt-4">
            <Link href="/chat">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                开始对话
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded bg-primary flex items-center justify-center">
                <Sparkles className="size-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ZhiTalk 智语
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="https://juejin.cn/user/1714893868765373/posts" target="_blank" className="hover:text-foreground transition-colors">
                双越
              </Link>
              <Link href="https://www.wangeditor.com/" target="_blank" className="hover:text-foreground transition-colors">
                wangEditor
              </Link>
              <Link href="https://www.huashuiai.com/" target="_blank" className="hover:text-foreground transition-colors">
                划水AI
              </Link>
              <Link href="https://www.mianshipai.com/" target="_blank" className="hover:text-foreground transition-colors">
                面试派
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

