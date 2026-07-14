import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

// O Flow: mascote do FoodFlow. Uma gotinha simpática em esmeralda.
// Ele é a identidade visual do assistente — aparece em todo lugar, sempre discreto.

export type FlowMood = "idle" | "happy" | "thinking" | "celebrating" | "sad" | "loading";

const SIZES = {
  xs: 32,
  sm: 44,
  md: 64,
  lg: 96,
  xl: 128,
} as const;

type FlowMascotProps = {
  mood?: FlowMood;
  size?: keyof typeof SIZES;
  className?: string;
};

export function FlowMascot({ mood = "idle", size = "md", className }: FlowMascotProps) {
  const px = SIZES[size];

  // movimento do corpo por humor
  const bodyAnim =
    mood === "celebrating"
      ? { y: [0, -8, 0], rotate: [0, -4, 4, 0] }
      : mood === "loading"
        ? { y: [0, -3, 0] }
        : mood === "sad"
          ? { y: [0, 1, 0] }
          : { y: [0, -4, 0] };

  const bodyTransition =
    mood === "celebrating"
      ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const }
      : mood === "loading"
        ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" as const }
        : { duration: 3, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <motion.svg
      width={px}
      height={px}
      viewBox="0 0 120 120"
      fill="none"
      className={cn("shrink-0 select-none", className)}
      role="img"
      aria-label="Flow, seu assistente"
      animate={bodyAnim}
      transition={bodyTransition}
      style={{ transformOrigin: "60px 90px" }}
    >
      <defs>
        <linearGradient id="flow-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(168 80% 46%)" />
          <stop offset="100%" stopColor="hsl(160 84% 36%)" />
        </linearGradient>
      </defs>

      {/* sombra suave no chão */}
      <motion.ellipse
        cx="60"
        cy="110"
        rx="30"
        ry="5"
        fill="hsl(160 40% 30%)"
        opacity="0.14"
        animate={{ rx: mood === "celebrating" ? [30, 26, 30] : [30, 32, 30] }}
        transition={bodyTransition}
      />

      {/* folhinha (identidade fresh) */}
      <path
        d="M60 16 C64 6 76 6 78 12 C80 18 70 24 60 22 Z"
        fill="hsl(142 70% 45%)"
      />
      <path d="M60 22 L60 30" stroke="hsl(160 84% 30%)" strokeWidth="3" strokeLinecap="round" />

      {/* corpo em gota */}
      <path
        d="M60 26 C88 26 100 52 100 72 C100 94 82 106 60 106 C38 106 20 94 20 72 C20 52 32 26 60 26 Z"
        fill="url(#flow-body)"
      />

      {/* brilho */}
      <ellipse cx="42" cy="50" rx="12" ry="16" fill="white" opacity="0.16" />

      {/* bochechas quentinhas */}
      {(mood === "happy" || mood === "celebrating") && (
        <>
          <circle cx="38" cy="76" r="6" fill="hsl(45 93% 60%)" opacity="0.55" />
          <circle cx="82" cy="76" r="6" fill="hsl(45 93% 60%)" opacity="0.55" />
        </>
      )}

      <FlowFace mood={mood} />

      {/* braços comemorando */}
      {mood === "celebrating" && (
        <>
          <motion.path
            d="M22 66 C10 58 8 46 12 40"
            stroke="hsl(160 84% 36%)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: "22px 66px" }}
          />
          <motion.path
            d="M98 66 C110 58 112 46 108 40"
            stroke="hsl(160 84% 36%)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: "98px 66px" }}
          />
          <motion.g
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <path d="M18 30 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z" fill="hsl(45 93% 55%)" />
            <path d="M100 22 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" fill="hsl(45 93% 55%)" />
          </motion.g>
        </>
      )}
    </motion.svg>
  );
}

// olhos e boca por humor. Olhos piscam sozinhos.
function FlowFace({ mood }: { mood: FlowMood }) {
  const blink = {
    animate: { scaleY: [1, 1, 0.1, 1] },
    transition: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] },
    style: { transformBox: "fill-box" as const, transformOrigin: "center" as const },
  };

  if (mood === "celebrating" || mood === "happy") {
    return (
      <>
        {/* olhos felizes (arcos ^ ^) */}
        <path d="M40 58 q6 -8 12 0" stroke="hsl(220 30% 15%)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M68 58 q6 -8 12 0" stroke="hsl(220 30% 15%)" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* sorrisão */}
        <path d="M46 74 q14 16 28 0" stroke="hsl(220 30% 15%)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (mood === "thinking") {
    return (
      <>
        <motion.circle cx="46" cy="60" r="5" fill="hsl(220 30% 15%)" {...blink} />
        <motion.circle cx="74" cy="60" r="5" fill="hsl(220 30% 15%)" {...blink} />
        {/* boca pensativa */}
        <path d="M50 80 q10 -4 20 0" stroke="hsl(220 30% 15%)" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* sobrancelha curiosa */}
        <path d="M66 48 q8 -3 14 1" stroke="hsl(220 30% 15%)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (mood === "sad") {
    return (
      <>
        <circle cx="46" cy="62" r="5" fill="hsl(220 30% 15%)" />
        <circle cx="74" cy="62" r="5" fill="hsl(220 30% 15%)" />
        {/* boca preocupada */}
        <path d="M48 82 q12 -12 24 0" stroke="hsl(220 30% 15%)" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* sobrancelhas caídas */}
        <path d="M40 50 q6 3 12 0" stroke="hsl(220 30% 15%)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M68 50 q6 -3 12 0" stroke="hsl(220 30% 15%)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    );
  }

  // idle / loading
  return (
    <>
      <motion.circle cx="46" cy="60" r="5.5" fill="hsl(220 30% 15%)" {...blink} />
      <motion.circle cx="74" cy="60" r="5.5" fill="hsl(220 30% 15%)" {...blink} />
      <path d="M48 76 q12 10 24 0" stroke="hsl(220 30% 15%)" strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  );
}
