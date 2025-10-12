import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { BookOpen, Coffee, User, ArrowRight, ArrowUpRight } from 'lucide-react'; // <-- Added ArrowUpRight
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';

type ToolCardProps = {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
};

const BoldToolCard = ({ onClick, title, children }: ToolCardProps) => {
    return (
        <div className="flex flex-col justify-between rounded-xl bg-white/50 p-6 text-black backdrop-blur-md border border-black/10 transition-all duration-300 hover:scale-[1.02] hover:bg-white/70 dark:bg-black/30 dark:text-white dark:border-white/20 dark:hover:bg-black/50">
            <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 text-black/70 dark:text-white/70">{children}</p>
            </div>
            <Button onClick={onClick} variant="secondary" className="mt-6 w-full sm:w-auto sm:self-start">
                Use Tool <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
};

export default function HomePage() {
    const { apiKey, openApiKeyModal } = useAppContext();
    const navigate = useNavigate();

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
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">DefineCraft 3.2</h1>
                                <p className="text-xs text-muted-foreground">Powered by zelux lab - with Google Gemini API</p>
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

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <section className="grid items-center gap-12 md:grid-cols-2">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            DefineCraft
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                            Define, compare, and discover the origins of words with the power of AI. Select a tool to begin.
                        </p>
                    </div>

                    <div className="relative rounded-2xl border border-border/50 p-6 overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/fri2.jpg"
                                alt="Abstract background"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-white/20 dark:bg-black/60" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <BoldToolCard 
                                onClick={() => handleProtectedNav('/definer')} 
                                title="Define & Compare Tools"
                            >
                                Get definitions, compare words, and find synonyms.
                            </BoldToolCard>
                            <BoldToolCard 
                                onClick={() => handleProtectedNav('/etymology')} 
                                title="Etymology Finder"
                            >
                                Uncover the origin and history of any word.
                            </BoldToolCard>
                        </div>
                    </div>
                </section>

                <footer className="w-full mt-24 pt-16 border-t border-border/50 space-y-8">
                {/* --- This is the updated transparent card section --- */}
                <div className="relative rounded-lg overflow-hidden border border-border/50">
                    {/* The background image layer */}
                    <img
                    src="/fri2.jpg"
                    alt="Abstract background pattern"
                    className="absolute inset-0 h-full w-full object-cover opacity-60 dark:opacity-40"
                    />

                    {/* The semi-transparent "glass" layer that sits on top */}
                    <div className="relative bg-black/10 backdrop-blur-lg">
                    <div className="grid md:grid-cols-2 items-center gap-8 p-8 md:p-12">
                        {/* Left Column: Text & CTA */}
                        <div className="space-y-4 text-white">
                        <h3 className="text-3xl font-bold tracking-tight text-shadow">
                            An Idea Was Born
                        </h3>
                        <p className="text-lg text-gray-200 text-shadow-sm">
                            Every great tool starts with a simple problem. Discover the story behind DefineCraft.
                        </p>
                        <Button asChild variant="secondary" className="mt-2 !w-full sm:!w-auto">
                            <Link to="/about">
                            Read the Full Story
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        </div>

                        {/* Right Column: Faded Icon */}
                        <div className="hidden md:flex items-center justify-center">
                        <BookOpen className="h-32 w-32 text-white/10" />
                        </div>
                    </div>
                    </div>
                </div>
                
                {/* Copyright line */}
                <p className="text-center text-sm text-muted-foreground pt-4">
                    Built with 🤍 by Min Khant! | All rights reserved to 'zelux lab'
                </p>
                </footer>

            </main>
        </div>
    );
}