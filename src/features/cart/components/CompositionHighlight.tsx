/** destaque de meio a meio — pra ninguém achar que é um sabor só */
export function CompositionHighlight({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "mt-1.5 inline-flex max-w-full flex-col gap-0.5 rounded-lg bg-brand/12 px-2.5 py-1.5 ring-1 ring-inset ring-brand/30"
      }
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-brand">
        Mais de um sabor
      </span>
      <span className="text-sm font-semibold leading-snug text-brand">{label}</span>
    </div>
  );
}
