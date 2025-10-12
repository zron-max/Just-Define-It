import { ThemeToggle } from '@/components/ThemeToggle';
import { BookOpen, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <main className="relative flex-grow flex items-center justify-center text-center overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-5 mix-blend-multiply dark:mix-blend-normal"
          style={{ backgroundImage: 'url(/436837.jpg)' }}
        />

        {/* Centered Text and Visuals */}
        <div className="relative z-10 p-4">
          <div className="flex justify-center mb-6">
            <Construction className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-foreground">
            Something New is Coming
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
            We're working hard on the next big feature for DefineCraft. Stay tuned!
          </p>
        </div>
      </main>
    </div>
  );
}