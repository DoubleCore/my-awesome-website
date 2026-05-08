import { Zap, ShoppingCart, ChevronDown, User } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

export function TopNav() {
  const { pathname } = useLocation();
  const inWorkspace = ["/workspace", "/chat", "/devices", "/remote", "/subscription"].some((p) =>
    pathname.startsWith(p),
  );
  const navItems = [
    { l: "产品", to: "/" as const },
    { l: "商城", to: "/" as const },
    { l: "关于我们", to: "/" as const },
    { l: "支持中心", to: "/" as const },
    { l: "工作台", to: "/workspace" as const },
    { l: "登录", to: "/" as const },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary glow-primary font-bold">
          S
        </div>
        <span className="text-lg font-semibold tracking-wide">
          SCI<span className="text-primary text-glow">Mate</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {navItems.map((i) => {
          const active = i.l === "工作台" ? inWorkspace : false;
          return (
            <Link
              key={i.l}
              to={i.to}
              className={`rounded-md px-4 py-2 text-sm transition-colors ${
                active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {i.l}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          to="/workspace"
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          控制台
        </Link>
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
