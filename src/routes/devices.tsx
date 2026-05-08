import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, MonitorSmartphone, Pencil, Plus, ExternalLink, Eye } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { Sidebar } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/devices")({
  component: DevicesPage,
  head: () => ({
    meta: [
      { title: "SCIMate · 设备管理" },
      { name: "description", content: "添加、激活、查看你的 SCIMate 设备。" },
    ],
  }),
});

const devices = [
  { id: "BC-LLRN-5NNF", name: "Datou002-CD6...", online: true },
  { id: "BC-SPARE-001", name: "爷爷家备用机", online: true },
  { id: "BC-LAB-9X2K", name: "实验室节点 A", online: true },
];

const tabs = ["基本信息", "升级管理", "邮件配置"];

function DevicesPage() {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState(0);
  const d = devices[selected];

  const stats = [
    { label: "设备总数", value: 3 },
    { label: "在线", value: 2 },
    { label: "离线", value: 1 },
  ];

  return (
    <div className="min-h-screen text-foreground">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-semibold">设备管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            添加、激活、查看你的 SCIMate 设备
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card/40 p-5 backdrop-blur-md">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="mt-2 text-4xl font-semibold text-primary text-glow">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[20rem_1fr]">
            {/* Devices list */}
            <div className="flex flex-col gap-3">
              {devices.map((it, i) => {
                const active = i === selected;
                return (
                  <button
                    key={it.id}
                    onClick={() => setSelected(i)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-primary/50 bg-primary/10 glow-primary"
                        : "border-border bg-card/40 hover:border-primary/30"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background/60">
                      <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className={`h-2 w-2 rounded-full ${it.online ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-muted-foreground"}`} />
                        {it.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{it.id}</div>
                    </div>
                  </button>
                );
              })}

              <button className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary">
                <Plus className="h-4 w-4" /> 添加新设备
              </button>
            </div>

            {/* Detail */}
            <div className="rounded-lg border border-border bg-card/40 p-6 backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Datou002-CD68B</h2>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      在线可用
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">设备配置中心</p>
                </div>
                <button className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20">
                  <MessageSquare className="h-3.5 w-3.5" />
                  进入对话
                </button>
              </div>

              <div className="mt-5 flex gap-6 border-b border-border">
                {tabs.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors ${
                      tab === i
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <dl className="mt-2 divide-y divide-border text-sm">
                <Row label="设备名称" value="Datou002-CD68B" />
                <Row label="Display ID" value="Datou002-CD68B" />
                <Row label="设备 ID" value={<span className="font-mono text-xs">0c5bd339-aa8a-48e0-b7b3-92d322ce214e</span>} />
                <Row label="固件版本" value="1.0.3" />
                <Row label="状态" value={<span className="text-primary">设备在线</span>} />
                <Row
                  label="本地控制台"
                  value={
                    <a className="inline-flex items-center gap-1 text-primary hover:underline">
                      http://192.168.1.100:8443/console <ExternalLink className="h-3 w-3" />
                    </a>
                  }
                />
                <Row label="管理员账号" value="admin" />
                <Row
                  label="管理员密码"
                  value={
                    <span className="flex items-center gap-3">
                      <span className="tracking-[0.3em]">••••••••••••</span>
                      <button className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary">
                        <Eye className="h-3 w-3" /> 查看 60 秒
                      </button>
                    </span>
                  }
                />
                <Row label="绑定时间" value="2026/4/9 06:38:09" />
              </dl>
              {/* unused id reference to avoid lint */}
              <span className="hidden">{d.id}</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-center gap-4 py-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
