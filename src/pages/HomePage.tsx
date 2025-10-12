import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { BookOpen, Coffee, User, ScrollText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { ToolCard } from '@/components/ToolCard';

export default function HomePage() {
    const { apiKey, openApiKeyModal } = useAppContext();
    const navigate = useNavigate();

    // This function guards navigation for protected tools
    const handleProtectedNav = (path: string) => {
        if (apiKey) {
            navigate(path);
        } else {
            openApiKeyModal();
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">DefineCraft 3.0</h1>
                                <p className="text-xs text-muted-foreground">Powered by zelux lab - with Google Gemini</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2">
                            <a href="https://tally.so/r/waVDBb" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="Buy me a coffee">
                                <Coffee className="h-4 w-4 text-muted-foreground" />
                            </a>
                            <Link to="/about" className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="About the developer">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-12">
                    <div className="text-center space-y-4 pt-4">
                        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">DefineCraft 3.0</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Select a tool below to begin. Define, compare, convert, and discover the origins of words with the power of AI.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ToolCard onClick={() => handleProtectedNav('/definer')} icon={Sparkles} title="Define & Compare Tools">
                            Get definitions, compare words, and find synonyms.
                        </ToolCard>
                        <ToolCard onClick={() => handleProtectedNav('/etymology')} icon={ScrollText} title="Etymology Finder">
                            Uncover the origin and history of any word.
                        </ToolCard>
                    </div>

                    <footer className="w-full mt-16 border-t border-border/50">
                        <div className="max-w-4xl mx-auto text-center py-12 px-4 sm:px-6 lg:px-8 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                    An Idea Was Born<span className="inline-block animate-pulse">⭐</span>
                                </h3>
                                <p className="mt-2 text-lg text-muted-foreground">
                                    DefineCraft: 14 Aug 2025
                                </p>
                                <Button asChild className="mt-6">
                                    <Link to="/about">
                                        Read the Full Story
                                        <span className="ml-2" role="img" aria-label="book emoji">📖</span>
                                    </Link>
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground pt-8 border-t border-dashed border-border/50">
                                Built with 🤍 by Min Khant! | All rights reserved to 'zelux lab'
                            </p>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}