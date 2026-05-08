import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, MessageCircle, Send, Feather } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { Sidebar } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/remote")({
  component: RemotePage,
  head: () => ({
    meta: [
      { title: "SCIMate · 远控通道" },
      { name: "description", content: "配置微信、飞书、QQ 与 SCIMate 设备的远程通道。" },
    ],
  }),
});

type Status = "connected" | "unconfigured";

interface Channel {
  key: string;
  name: string;
  Icon: typeof MessageCircle;
  desc: string;
  account: string;
  status: Status;
  recent: string;
  connectLabel: string;
  disconnectLabel?: string;
}

const channels: Channel[] = [
  {
    key: "wechat",
    name: "微信",
    Icon: MessageCircle,
    desc: "在设备端扫码完成授权后，家长微信可接收学习提醒与通道消息，数据经加密同步。",
    account: "微信",
    status: "connected",
    recent: "0 次",
    connectLabel: "连接微信",
    disconnectLabel: "断开",
  },
  {
    key: "qq",
    name: "QQ",
    Icon: Send,
    desc: "绑定 QQ 机器人后，可在群内或私聊接收设备侧推送的学习与状态摘要。",
    account: "QQ 机器人",
    status: "connected",
    recent: "28 次",
    connectLabel: "连接 QQ",
    disconnectLabel: "断开",
  },
  {
    key: "feishu",
    name: "飞书",
    Icon: Feather,
    desc: "通过飞书应用或机器人完成授权，即可在组织内接收报告与告警（需设备在线）。",
    account: "—",
    status: "unconfigured",
    recent: "0 次",
    connectLabel: "连接飞书",
  },
];

function RemotePage() {
  return (
    <div className="min-h-screen text-foreground">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-semibold">远控通道</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            配置微信、飞书、QQ 与 SCIMate 设备的远程通道
          </p>

          <div className="mt-6 max-w-md">
            <div className="text-xs text-muted-foreground">当前设备</div>
            <button className="mt-2 flex w-full items-center justify-between rounded-md border border-border bg-card/40 px-4 py-2.5 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                Datou002-CD68B
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {channels.map((c) => (
              <ChannelCard key={c.key} channel={c} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  const [connected, setConnected] = useState(channel.status === "connected");
  const Icon = channel.Icon;

  return (
    <div className="flex min-h-[28rem] flex-col rounded-lg border border-border bg-card/40 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold">{channel.name}</span>
        </div>
        {connected ? (
          <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            已连接
          </span>
        ) : (
          <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            未配置
          </span>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{channel.desc}</p>

      <div className="mt-5 rounded-md border border-border bg-background/40 p-4">
        <KV label="绑定设备" value={connected ? "Datou002-CD68B" : "—"} />
        <KV label="通道账号" value={connected ? channel.account : "—"} />
        <KV
          label="连接状态"
          value={
            connected ? (
              <span className="text-primary">已连接</span>
            ) : (
              <span className="text-amber-400">未配置</span>
            )
          }
        />
        <KV label="最近三天交互" value={connected ? channel.recent : "0 次"} last />
      </div>

      <div className="flex-1" />

      <button
        onClick={() => setConnected((v) => !v)}
        className={`mt-5 w-full rounded-md py-2.5 text-sm font-semibold transition-colors ${
          connected
            ? "border border-border bg-background/40 text-foreground hover:bg-background/60"
            : "bg-primary text-primary-foreground glow-primary hover:brightness-110"
        }`}
      >
        {connected ? channel.disconnectLabel ?? "断开" : channel.connectLabel}
      </button>
    </div>
  );
}

function KV({
  label,
  value,
  last,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 text-xs ${last ? "" : "border-b border-border/60"}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
