import { motion } from 'framer-motion';
import { ToolCard } from './ToolCard';
import { LucideIcon } from 'lucide-react';

interface AnimatedCardProps {
    onClick: () => void;
    icon: LucideIcon;
    title: string;
    children: React.ReactNode;
}

export const AnimatedCard = ({ onClick, icon, title, children }: AnimatedCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <ToolCard onClick={onClick} icon={icon} title={title}>
                {children}
            </ToolCard>
        </motion.div>
    );
};
