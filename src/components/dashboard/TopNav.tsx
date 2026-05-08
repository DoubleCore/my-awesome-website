import { Zap, ShoppingCart, ChevronDown, User } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary glow-primary font-bold">
          S
        </div>
        <span className="text-lg font-semibold tracking-wide">
          SCI<span className="text-primary text-glow">Mate</span>
        </span>
      </div>

      <NavLinks />

      <div className="flex items-center gap-2">
        <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          控制台
        </button>
        <div className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">12,832</span>
        </div>
        <button className="relative rounded-md border border-border p-1.5">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            1
          </span>
        </button>
        <button className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/15 text-primary">
            <User className="h-3 w-3" />
          </span>
          用户2121
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
        <button className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground glow-primary hover:brightness-110">
          立即购买
        </button>
      </div>
    </header>
  );
}
