import { ThemeToggle } from '@/components/ThemeToggle';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      `Page not found: ${location.pathname}`
    );
  }, [location.pathname]);

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
        <div className="relative z-10 p-4">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-primary animate-bounce" />
          </div>
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-primary animate-pulse">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-4">
            Page Not Found
          </h2>
          
          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
            Oops! The page you are looking for does not exist.
            Ensure the url you typed is correct.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Go back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;