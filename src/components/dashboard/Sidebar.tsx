import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, MessageSquare, Cpu, Radio, Star, HelpCircle, ChevronLeft, ChevronDown } from "lucide-react";

const items = [
  { icon: LayoutGrid, label: "数据概览", to: "/workspace" },
  { icon: MessageSquare, label: "人机对话", to: "/chat" },
  { icon: Cpu, label: "设备管理", to: "/devices" },
  { icon: Radio, label: "远控通道", to: "/remote" },
  { icon: Star, label: "积分订阅", to: "/subscription" },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-border bg-sidebar/40 backdrop-blur-md">
      <div>
        <div className="flex items-center justify-end px-4 py-3">
          <button className="rounded p-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <nav className="px-3">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.label}
                to={it.to}
                className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary glow-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          帮助中心
        </button>
        <div className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/15 text-xs font-bold text-primary">
              用
            </span>
            <div className="text-xs leading-tight">
              <div className="font-medium">用户2121</div>
              <div className="text-[10px] text-muted-foreground">已订阅</div>
            </div>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
