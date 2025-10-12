import React from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Mail, Send, Target, Users, Code, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'

const ZeluxLabIcon = () => <img src="/zelux-lab.png" alt="zelux-lab logo" className="w-10 h-10" />
const CodeIcon = () => <Code className="h-5 w-5 text-primary" />
const LinkIconComponent = () => <LinkIcon className="h-5 w-5 text-primary" />
const NiooIcon = () => <img src="/DefineCraft2.png" alt="UFC TimeCalculator logo" className="w-10 h-10" />

const projects = [
  {
    icon: ZeluxLabIcon,
    title: 'zelux-lab',
    description:
      'Home to all my projects, articles, and creative work. Discover tools that blend design and technology.',
    link: 'https://tally.so/r/3xOAjv'
  },
  {
    icon: CodeIcon,
    title: 'Momentum Grid',
    description:
      'A minimalist momentum tracker to help you build good habits and stay consistent on your goals.',
    link: 'https://momentum-grid.vercel.app/'
  },
  {
    icon: LinkIconComponent,
    title: 'More Projects',
    description:
      "New AI-powered tools and utilities are always in the works. Stay tuned for what's next.",
    link: 'https://t.me/definecraft'
  },
  {
    icon: NiooIcon,
    title: 'UFC TimeCalculator',
    description: 'Coming soon.',
    link: '/coming-soon'
  }
]

export default function AboutPage() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  // Ensure autoplay resets on loop
  const handlePrev = () => {
    plugin.current?.stop()
    plugin.current?.play()
  }

  const handleNext = () => {
    plugin.current?.stop()
    plugin.current?.play()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">DefineCraft</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="space-y-24">
          <section className="text-center flex flex-col items-center">
            <img
              src="/profile.jpg"
              alt="Min Khant"
              className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-card shadow-md"
            />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Hi, I'm Min Khant</h1>
            <p className="text-xl text-muted-foreground mt-2">Solopreneur & Founder of ZELUX-lab</p>
            <p className="mt-6 max-w-2xl text-foreground/80 leading-relaxed">
              I believe in Buddha and the transformative power of AI. My dream is to build ZELUX-lab
              into an organization that provides valuable knowledge and powerful tools to make you
              more productive and better at managing life.
            </p>
          </section>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="hidden md:flex justify-center items-center">
                <img src="/zelux-lab.png" alt="logomark" className="w-20 h-20 opacity-90" />
              </div>
              <div className="md:col-span-2">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Our Mission
                </h2>
                <blockquote className="border-l-4 border-primary pl-6">
                  <p className="font-serif text-xl text-foreground/90">
                    To solve problems with technology, making language learning and productivity
                    accessible, powerful, and fun through clean design and cutting-edge AI.
                  </p>
                </blockquote>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-center mb-8">More from ZELUX-lab</h2>
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              opts={{ align: 'start', loop: true }}
            >
              <CarouselContent className="-ml-4">
                {projects.map((project, index) => (
                  <CarouselItem
                    key={`${project.title}-${index}`}
                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1 h-full">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <Card className="flex flex-col justify-between p-6 h-full bg-gradient-card border-border/50 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                          <div>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                              <project.icon />
                            </div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                          </div>
                          <CardDescription className="mt-2">{project.description}</CardDescription>
                        </Card>
                      </a>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious onClick={handlePrev} className="hidden sm:flex" />
              <CarouselNext onClick={handleNext} className="hidden sm:flex" />
            </Carousel>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" /> The Story Behind DefineCraft
            </h2>
            <div className="prose dark:prose-invert max-w-2xl mx-auto text-foreground/80 space-y-4">
              <p>
                As a young English learner, I spent countless hours watching movies and anime. I
                would note down every new vocabulary word I came across, determined to study them
                later. But the truth is—I rarely did. Looking up each word one by one drained both my
                time and motivation.
              </p>
              <p>Searching on Cambridge Dictionary was helpful but slow. That’s when the idea struck:</p>
              <blockquote className="border-l-4 border-primary/50 pl-4 italic text-foreground">
                "What if I could search multiple words at once, get definitions, examples, and
                pronunciation based on my preferred English level, and download it all as a text
                file?"
              </blockquote>
              <p>
                And that's how DefineCraft was born. It's the tool I always wished I had, built for
                language learners everywhere.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <Send className="h-6 w-6 text-primary" /> Get in Touch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" /> Work With Me
                  </CardTitle>
                  <CardDescription>Have a project or problem you need help with?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Whether you're an individual with an idea or a business seeking a technical
                    solution, I'm here to help. Let's connect and discuss how we can bring your
                    project to life.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <a href="mailto:xellazron@gmail.com">Email</a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <a
                        href="https://t.me/zforzeron"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Telegram
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> Connect & Contribute
                  </CardTitle>
                  <CardDescription>Join the mission or share your feedback.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    ZELUX-lab is growing! If you believe in the power of AI and clean design, let's
                    build the future together. Your feedback and suggestions are also what make this
                    app better.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <a
                        href="https://t.me/DefineCraft"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join the Community (Telegram)
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
