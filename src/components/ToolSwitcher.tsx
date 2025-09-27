import { motion } from 'framer-motion'
import { BookOpen, Scale, Sparkles, LucideIcon } from 'lucide-react'
import { PromptType } from './shared/types' // Assuming this type is in a shared file

// Define the structure for each tool to keep our code clean and scalable
interface Tool {
    id: PromptType;
    title: string;
    description: string;
    Icon: LucideIcon;
    accentClass: string;
    hoverClass: string;
}

// A single configuration array drives the entire component.
// Adding a new tool is as simple as adding a new object here.
const tools: Tool[] = [
    {
        id: 'define',
        title: 'Define Words',
        description: 'Get detailed definitions',
        Icon: BookOpen,
        accentClass: 'bg-mode-define-accent',
        hoverClass: 'hover:bg-mode-define-hover/50',
    },
    {
        id: 'difference',
        title: 'Compare Words',
        description: 'Find key differences',
        Icon: Scale,
        accentClass: 'bg-mode-compare-accent',
        hoverClass: 'hover:bg-mode-compare-hover/50',
    },
    {
        id: 'synonyms',
        title: 'Find Synonyms',
        description: 'Discover alternatives',
        Icon: Sparkles,
        accentClass: 'bg-mode-synonyms-accent',
        hoverClass: 'hover:bg-mode-synonyms-hover/50',
    },
];

interface ToolSwitcherProps {
    activeTool: PromptType;
    onToolChange: (tool: PromptType) => void;
}

export default function ToolSwitcher({ activeTool, onToolChange }: ToolSwitcherProps) {
    return (
        <div className="bg-background/50 backdrop-blur-sm rounded-xl p-2 border border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onToolChange(tool.id)}
                        className={`group relative flex items-center gap-3 p-4 rounded-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${activeTool === tool.id ? '' : `hover:bg-zinc-800/50`
                            }`}
                    >
                        {/* The animated sliding background. `framer-motion` handles the magic. */}
                        {activeTool === tool.id && (
                            <motion.div
                                layoutId="active-tool-indicator"
                                className={`absolute inset-0 z-0 rounded-lg ${tool.accentClass}`}
                                style={{ borderRadius: 8 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                        )}

                        {/* Icon */}
                        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                            <tool.Icon className={`h-5 w-5 ${activeTool === tool.id ? 'text-white' : 'text-primary'}`} />
                        </div>

                        {/* Text content */}
                        <div className="relative z-10 text-left">
                            <div className={`font-medium text-sm transition-colors ${activeTool === tool.id ? 'text-white' : 'text-foreground'}`}>
                                {tool.title}
                            </div>
                            <div className={`text-xs transition-colors ${activeTool === tool.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                                {tool.description}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}