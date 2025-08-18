import WordDefiner from '@/components/WordDefiner'
import WordListConverter from '@/components/WordListConverter'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BookOpen, Coffee, User } from 'lucide-react'

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">DefiniyCraft 2.0</h1>
                <p className="text-xs text-muted-foreground">Powered by Google Gemini | zelux lab V-1.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="https://t.me/+sno3zzI-gMEyZWJl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Coffee className="h-4 w-4 text-muted-foreground" />
              </a>
              <a 
                href="https://t.me/zforzron" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              DefiniyCraft: Google AI-Powered Dictionary
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cambridge Dictionary | Discover comprehensive definitions, Compare Words, Find Sysnonyms with real-world examples 
              powered by zelux lab using Google Gemini AI.
            </p>
          </div>

          {/* Word Definer Component */}
          <WordDefiner />

          {/* Word List Converter */}
          <WordListConverter />

          {/* Footer */}
          <footer className="text-center pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Built with 🤍💦 by Min Khant! | All rights served to 'zelux lab
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
