import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  sub: string;
  value: string;
  delta: string;
  icon: LucideIcon;
}

export function StatCard({ label, sub, value, delta, icon: Icon }: Props) {
  return (
    <div className="panel scanline relative overflow-hidden p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-xs text-muted-foreground/70">{sub}</div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="font-mono text-5xl font-light tracking-tight text-foreground text-glow">
          {value}
        </div>
        <div className="flex h-8 items-end gap-0.5">
          {[3, 5, 4, 7, 6, 9, 7, 10].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h * 3}px` }}
              className="w-1 rounded-sm bg-primary/60"
            />
          ))}
        </div>
      </div>
      <div className="mt-2 text-xs text-primary/80">{delta}</div>
    </div>
  );
}
