import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type ToolCardProps = {
    title: string;
    description: string;
    onClick: () => void;
};

export function ToolCard({ title, description, onClick }: ToolCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-card p-8 rounded-xl border border-border/50 cursor-pointer"
            onClick={onClick}
        >
            <h4 className="text-xl font-semibold mb-2">{title}</h4>
            <p className="text-muted-foreground">{description}</p>
            <div className="mt-4 flex items-center text-primary">
                <span>Use Tool</span>
                <ArrowRight className="ml-2 h-4 w-4" />
            </div>
        </motion.div>
    );
}