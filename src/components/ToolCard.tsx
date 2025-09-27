import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToolCardProps = {
    onClick?: () => void;
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    variant?: 'nav' | 'action';
    className?: string;
};

export function ToolCard({ onClick, icon: Icon, title, children, variant = 'nav', className }: ToolCardProps) {
    const isAction = variant === 'action';

    const cardContent = (
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {title}
                </CardTitle>
                <CardDescription className="pl-11">{children}</CardDescription>
            </div>
            {isAction ? (
                <div className="font-semibold text-xs text-primary bg-primary/10 py-1 px-3 rounded-full">
                    QUICK TOOL
                </div>
            ) : (
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
            )}
        </CardHeader>
    );

    return (
        <div
            onClick={onClick}
            className={cn(
                'group block cursor-pointer',
                className
            )}
            role="button"
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
        >
            <Card className="bg-gradient-card border-border/50 shadow-elegant h-full hover:shadow-elegant-hover hover:border-primary/50 transition-all duration-300">
                {cardContent}
            </Card>
        </div>
    );
}
