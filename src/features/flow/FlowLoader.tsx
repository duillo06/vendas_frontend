import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import { FlowMascot } from "./FlowMascot";

type FlowLoaderProps = {
  text?: string;
  className?: string;
};

// Loader elegante: o Flow "trabalhando" enquanto algo carrega.
export function FlowLoader({ text = "Só um instante...", className }: FlowLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}>
      <FlowMascot mood="loading" size="md" />
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-brand"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
  );
}
