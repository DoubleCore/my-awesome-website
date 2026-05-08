import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  MessageSquare,
  Plus,
  Send,
  CloudSun,
  BookOpen,
  Mail,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { Sidebar } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "SCIMate · 人机对话" },
      { name: "description", content: "通用对话助手，支持天气、知识问答、邮件、待办与文档分析。" },
    ],
  }),
});

const devices = [
  { name: "BC-DEMO", desc: "通用助手", active: true },
];

const capabilities = [
  { icon: CloudSun, title: "天气提醒", desc: "查询实时天气，设置每日推送。" },
  { icon: BookOpen, title: "知识库", desc: "上传文档构建私有知识库，支持问答。" },
  { icon: Mail, title: "邮件发送", desc: "起草与发送邮件，处理日常往来。" },
  { icon: CalendarDays, title: "待办清单与提醒", desc: "创建任务、设置提醒、管理日程。" },
  { icon: Sparkles, title: "文档读取分析", desc: "上传文档自动阅读、分析与摘要。" },
];

function ChatPage() {
  const [input, setInput] = useState("");
  return (
    <div className="min-h-screen text-foreground">
      <TopNav />
      <div className="flex">
        <Sidebar />

        {/* Conversations panel */}
        <div className="flex w-72 shrink-0 flex-col border-r border-border bg-sidebar/30 backdrop-blur-md">
          <div className="px-5 pt-6 pb-3">
            <div className="mb-2 text-xs text-muted-foreground">当前设备</div>
            <button className="flex w-full items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                BC-DEMO
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="px-3">
            {devices.map((d) => (
              <div
                key={d.name}
                className={`mb-2 rounded-md px-3 py-3 ${
                  d.active
                    ? "border border-primary/40 bg-primary/10 glow-primary"
                    : "border border-border bg-card/30"
                }`}
              >
                <div className={`text-sm font-semibold ${d.active ? "text-primary" : ""}`}>
                  {d.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{d.desc}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="text-xs">暂无历史对话</div>
          </div>

          <div className="p-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground">
              <Plus className="h-4 w-4" />
              新建对话
            </button>
          </div>
        </div>

        {/* Chat main */}
        <main className="relative flex flex-1 flex-col">
          <div className="flex justify-end px-8 pt-5">
            <button className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Plus className="h-3 w-3" /> 新建对话
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-8 pb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/15 glow-primary">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold">
              Hi，我是 <span className="text-primary text-glow">BC-DEMO</span>
            </h1>
            <p className="mt-3 max-w-xl text-center text-sm text-muted-foreground">
              通用对话助手，支持天气查询、知识问答、邮件草稿、待办提醒与文档分析。描述任务或直接提问即可开始。
            </p>

            <div className="mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
              {capabilities.map((c) => (
                <button
                  key={c.title}
                  className="rounded-lg border border-border bg-card/40 p-5 text-left transition-colors hover:border-primary/50 hover:bg-card/60"
                >
                  <c.icon className="mb-3 h-5 w-5 text-primary" />
                  <div className="text-sm font-semibold">{c.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="mx-auto flex max-w-5xl items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="可以描述任务或提问任何问题"
                className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground glow-primary hover:brightness-110">
                <Send className="h-3.5 w-3.5" />
                发送
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
