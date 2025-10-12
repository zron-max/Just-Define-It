import WordDefiner from '@/components/WordDefiner';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DefinerPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to All Tools
                        </Link>

                        {/* --- THIS SECTION IS NOW CORRECT --- */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-white" />
                                </div>
                                <a href="https://t.me/DefineCraft" target='_blank' rel='noopener noreferrer' className="text-lg font-semibold text-foreground hover:underline">
                                    <span className="font-semibold text-foreground">DefineCraft 3.2</span>
                                </a>
                            </div>
                            <ThemeToggle />
                        </div>
                        {/* --- END of fix --- */}

                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WordDefiner />
            </main>
        </div>
    );
}