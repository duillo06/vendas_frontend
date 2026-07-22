import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";

import { cn } from "@/shared/lib/utils";

export type TickerMessage =
  | string
  | {
      text: string;
      /** se tiver, a mensagem vira link */
      to?: string;
    };

type Props = {
  messages: TickerMessage[];
  /** ms entre trocas — só gira se tiver 2+ */
  intervalMs?: number;
  className?: string;
};

function messageKey(msg: TickerMessage): string {
  return typeof msg === "string" ? msg : `${msg.to ?? ""}:${msg.text}`;
}

function MessageBody({ msg }: { msg: TickerMessage }) {
  if (typeof msg === "string") return <>{msg}</>;
  if (msg.to) {
    return (
      <Link to={msg.to} className="hover:text-brand">
        {msg.text}
      </Link>
    );
  }
  return <>{msg.text}</>;
}

/** uma linha viva — igual a home, sem card grosso poluindo a tela */
export function MessageTicker({ messages, intervalMs = 3800, className }: Props) {
  const list = messages.filter((m) => {
    const text = typeof m === "string" ? m : m.text;
    return Boolean(text?.trim());
  });
  const listKey = list.map(messageKey).join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [listKey]);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [list.length, intervalMs]);

  if (!list.length) return null;

  const current = list[index % list.length];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[hsl(var(--border)/0.8)] bg-gradient-to-r from-[hsl(var(--muted)/0.55)] via-[hsl(var(--primary)/0.06)] to-[hsl(var(--muted)/0.45)] px-3.5 py-2.5",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={messageKey(current)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="truncate text-[13px] font-medium text-[hsl(var(--foreground))]"
        >
          <MessageBody msg={current} />
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
