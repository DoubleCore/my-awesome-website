import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Workflow,
  Brain,
  Layers,
  ArrowRight,
  Network,
  Share2,
  Sparkles,
  CheckCircle2,
  Lock,
  FileSearch,
  FlaskConical,
  Wand2,
  Cpu,
  Cloud,
  Database,
  Bot,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "SCIMate · 让科研人省时，也让科研结果更可信" },
      {
        name: "description",
        content:
          "SCIMate 以双图谱驱动的科研流水线，覆盖检索、模拟、报告、邮件等十三大模块，专为科研团队打造。",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen text-foreground">
      <TopNav />
      <main>
        <Hero />
        <ModuleStrip />
        <FourDilemmas />
        <DualGraphs />
        <ThirteenModules />
        <CapabilityMatrix />
        <Pipeline />
        <Architecture />
        <Security />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------ HERO ------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary/80">
            Your Companion in Research Activities
          </div>
          <h1 className="mt-5 text-6xl font-semibold tracking-tight">
            SCI<span className="text-primary text-glow">Mate</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            让科研人省时，也让科研结果更可信。<br />
            以双图谱驱动的科研流水线，覆盖检索、模拟、报告、邮件 → AICT。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/workspace"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-primary hover:brightness-110"
            >
              立即购买
            </Link>
            <button className="rounded-md border border-border bg-card/40 px-5 py-2.5 text-sm hover:border-primary/40 hover:text-primary">
              了解更多
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="panel relative overflow-hidden p-4 scanline">
            <div className="aspect-[16/10] rounded-md bg-gradient-to-br from-primary/10 via-background to-primary/5">
              <DeviceGraphic />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeviceGraphic() {
  return (
    <svg viewBox="0 0 600 380" className="h-full w-full">
      <defs>
        <radialGradient id="hr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="220" cy="190" r="140" fill="url(#hr)" />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle
          key={i}
          cx={220 + Math.cos((i / 10) * Math.PI * 2) * 120}
          cy={190 + Math.sin((i / 10) * Math.PI * 2) * 120}
          r="3"
          fill="var(--primary)"
        />
      ))}
      <g stroke="var(--primary)" strokeOpacity="0.5" fill="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={i}
            x1="220"
            y1="190"
            x2={220 + Math.cos((i / 10) * Math.PI * 2) * 120}
            y2={190 + Math.sin((i / 10) * Math.PI * 2) * 120}
            className="dash-pulse"
          />
        ))}
      </g>
      {/* device */}
      <g transform="translate(380,120)">
        <rect width="170" height="120" rx="10" fill="var(--card)" stroke="var(--primary)" strokeOpacity="0.5" />
        <rect x="10" y="10" width="150" height="80" rx="4" fill="var(--background)" />
        <rect x="20" y="20" width="60" height="6" fill="var(--primary)" opacity="0.7" />
        <rect x="20" y="32" width="100" height="4" fill="var(--primary)" opacity="0.4" />
        <rect x="20" y="42" width="80" height="4" fill="var(--primary)" opacity="0.4" />
        <circle cx="85" cy="105" r="5" fill="var(--primary)" />
      </g>
    </svg>
  );
}

/* ------------------------------ MODULE STRIP ------------------------------ */
function ModuleStrip() {
  const items = [
    { k: "KG1", l: "科研图谱", d: "Research Graph" },
    { k: "KG2", l: "知识图谱", d: "Knowledge Graph" },
    { k: "AI 边缘", l: "本地推理", d: "Edge AI" },
    { k: "邮指导", l: "邮件提醒", d: "Mail Notice" },
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-10 md:grid-cols-4">
        {items.map((i) => (
          <div
            key={i.k}
            className="rounded-lg border border-border bg-card/40 p-4 text-center backdrop-blur-md transition-colors hover:border-primary/40"
          >
            <div className="text-sm font-semibold text-primary text-glow">{i.k}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{i.l}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {i.d}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto -mt-4 mb-10 max-w-3xl rounded-lg border border-border bg-card/30 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-around text-xs">
          <Counter k="2" v="双图谱" />
          <Counter k="13" v="模块" />
          <Counter k="∞" v="可扩展" />
          <Counter k="A100" v="算力" />
        </div>
      </div>
    </section>
  );
}

function Counter({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-semibold text-primary text-glow">{k}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{v}</div>
    </div>
  );
}

/* ------------------------------ FOUR DILEMMAS ------------------------------ */
function FourDilemmas() {
  const items = [
    { Icon: ShieldCheck, t: "安全焦虑", d: "敏感资料外发，怕泄密——SCIMate 端侧加密同步。" },
    { Icon: FileSearch, t: "选题困难", d: "海量文献无从下手，KG 自动聚类。" },
    { Icon: Network, t: "知识孤岛", d: "团队分散导致协同困难。SCIMate 双图谱拉通信息。" },
    { Icon: Sparkles, t: "效率低下", d: "重复操作太多，让流水线自动化执行。" },
  ];
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          科研人员的<span className="text-primary text-glow">四大困境</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          安全感、效率、视野、协同——SCIMate 用双图谱与端侧 AI 一并解决。
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <div
              key={i.t}
              className="rounded-lg border border-border bg-card/40 p-6 backdrop-blur-md transition-colors hover:border-primary/40"
            >
              <i.Icon className="h-5 w-5 text-primary" />
              <div className="mt-4 text-base font-semibold">{i.t}</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ DUAL GRAPHS ------------------------------ */
function DualGraphs() {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          特色化知识库 · <span className="text-primary text-glow">双图谱驱动</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          领域图谱 KG1 + 长期记忆图谱 KG2，让模型既懂学科，也懂你。
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <GraphCard
            tag="KG1"
            title="领域知识图谱"
            Icon={Network}
            bullets={[
              "PubMed / arXiv / 行业文献等结构化抽取",
              "概念—实验—指标三级关系",
              "支持开源 + 私有数据并行",
              "可视化检索 + 子图筛选",
            ]}
          />
          <GraphCard
            tag="KG2"
            title="长期记忆图谱"
            Icon={Share2}
            bullets={[
              "记录团队工作偏好与术语",
              "私有 / 团队 / 个人三层粒度",
              "对话级别的上下文复用",
              "端侧加密、可一键销毁",
            ]}
          />
        </div>
        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 px-6 py-4 sm:flex-row">
          <div className="text-sm">
            <span className="text-primary text-glow">KG1 + KG2</span> 联合驱动 · 检索更准、生成更稳
          </div>
          <button className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground glow-primary">
            了解知识图谱
          </button>
        </div>
      </div>
    </section>
  );
}

function GraphCard({
  tag,
  title,
  Icon,
  bullets,
}: {
  tag: string;
  title: string;
  Icon: typeof Network;
  bullets: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-6 backdrop-blur-md">
      <div className="flex items-center gap-2 text-primary">
        <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          {tag}
        </span>
        <span className="text-base font-semibold">{title}</span>
      </div>
      <div className="mt-5 grid grid-cols-[5rem_1fr] gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-md border border-primary/30 bg-primary/5 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------ THIRTEEN MODULES ------------------------------ */
function ThirteenModules() {
  const list = [
    "SciFetch",
    "SciSummary",
    "SciTrend",
    "SciSim",
    "SciCheck",
    "SciAct",
    "SciDraft",
    "SciCite",
    "SciKG1",
    "SciKG2",
    "SciMail",
    "SciOps",
    "SciSafe",
  ];
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          科研全生命周期 · <span className="text-primary text-glow">十三大模块</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          从选题、文献、模拟到审稿，13 个原子模块组合任意流水线，按需启停。
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[18rem_1fr]">
          <ul className="space-y-1.5 rounded-lg border border-border bg-card/40 p-3">
            {list.map((m, i) => (
              <li
                key={m}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-xs ${
                  i === 3
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-background/60"
                }`}
              >
                <span>{m}</span>
                <span className="text-[10px] opacity-60">M{(i + 1).toString().padStart(2, "0")}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-border bg-card/40 p-5 font-mono text-[11px] leading-6">
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
              <span className="ml-3 text-muted-foreground">SciSim · run.json</span>
            </div>
            <pre className="text-muted-foreground">
              <span className="text-primary">{`{`}</span>
              {"\n"}  <span className="text-primary">"pipeline"</span>: <span className="text-amber-300">"sci-sim"</span>,{"\n"}
              {"  "}<span className="text-primary">"input"</span>: {`{`} <span className="text-primary">"papers"</span>: <span className="text-amber-300">"kg1://papers/2025-Q2"</span> {`}`},{"\n"}
              {"  "}<span className="text-primary">"steps"</span>: [<span className="text-amber-300">"fetch"</span>, <span className="text-amber-300">"summary"</span>, <span className="text-amber-300">"sim"</span>, <span className="text-amber-300">"check"</span>],{"\n"}
              {"  "}<span className="text-primary">"backend"</span>: <span className="text-amber-300">"local-a100"</span>,{"\n"}
              {"  "}<span className="text-primary">"out"</span>: <span className="text-amber-300">"reports/2025-Q2.md"</span>{"\n"}
              <span className="text-primary">{`}`}</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ CAPABILITY MATRIX ------------------------------ */
function CapabilityMatrix() {
  const rows = [
    ["选题", "知识趋势", "AI 自动 + 人工策展"],
    ["文献", "Knowledge", "KG1 自动检索"],
    ["实验", "Lab", "本地仿真 + 数据集"],
    ["数据", "Dataset", "权属管理 + 多端同步"],
    ["建模", "Modeling", "可视化 + Schema 校验"],
    ["报告", "Coverage", "自动生成 + 模板复用"],
    ["投稿", "Submit", "AI 助理 + 多刊适配"],
    ["审稿", "Review", "拒稿原因总结 + 复议"],
  ];
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          科研全生命周期<span className="text-primary text-glow">能力矩阵</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          从选题到投稿，每一步都可量化、每一步都有数据资产沉淀。
        </p>
        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-card/40">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">阶段</th>
                <th className="px-5 py-3 text-left font-medium">核心模块</th>
                <th className="px-5 py-3 text-left font-medium">价值</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([s, m, v], i) => (
                <tr
                  key={s}
                  className={`border-t border-border/60 ${i % 2 ? "bg-background/20" : ""}`}
                >
                  <td className="px-5 py-3 font-medium text-primary">{s}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m}</td>
                  <td className="px-5 py-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ PIPELINE ------------------------------ */
function Pipeline() {
  const steps = [
    { Icon: FileSearch, t: "SciFetch", d: "文献检索" },
    { Icon: FlaskConical, t: "SciSim", d: "可信模拟" },
    { Icon: Wand2, t: "SciAct", d: "执行设计" },
  ];
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          核心流水线 · <span className="text-primary text-glow">SciFetch → SciSim → SciAct</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          以三段式流水线串接所有模块，按需替换、按需扩展，团队协作无缝衔接。
        </p>
        <div className="mt-12 flex items-center justify-between gap-3">
          {steps.map((s, i) => (
            <div key={s.t} className="flex flex-1 items-center gap-3">
              <div className="flex flex-1 flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 glow-primary">
                  <s.Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="mt-3 text-sm font-semibold">{s.t}</div>
                <div className="text-[11px] text-muted-foreground">{s.d}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 shrink-0 text-primary/60" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          所有流程支持 Discovery → Validation → Action 三阶段，可视化跟踪每一步耗时与质量。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground glow-primary">
            查看流水线案例
          </button>
          <button className="rounded-md border border-border px-5 py-2 text-xs hover:border-primary/40 hover:text-primary">
            预约演示
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ ARCHITECTURE ------------------------------ */
function Architecture() {
  const cards = [
    {
      Icon: Cloud,
      t: "混合云架构",
      sub: "公有云 / 私有云",
      lines: ["端 → 边 → 云", "数据驻留可选 · 国产化适配"],
    },
    {
      Icon: Bot,
      t: "AI 模型矩阵",
      sub: "多模型协同",
      lines: ["LLM · VLM · Agent", "支持本地 / API 切换"],
    },
    {
      Icon: Database,
      t: "数据底座",
      sub: "知识资产化",
      lines: ["Postgres · Redis · KG", "Iceberg / Lakehouse 接入"],
    },
    {
      Icon: Cpu,
      t: "DevOps 流水线",
      sub: "持续交付",
      lines: ["GitOps + CI/CD", "K8s + Argo + Tekton"],
    },
    {
      Icon: ShieldCheck,
      t: "安全合规底座",
      sub: "端侧加密",
      lines: ["全链路审计", "RBAC + ABAC"],
    },
  ];
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          技术架构 · <span className="text-primary text-glow">安全可靠</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          基础底座 → 模型 → 应用 — 每一层都强调可观测性与安全合规。
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.t}
              className="rounded-lg border border-border bg-card/40 p-5 backdrop-blur-md transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <c.Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">{c.t}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {c.sub}
                  </div>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                {c.lines.map((l) => (
                  <li key={l} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <button className="rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground glow-primary">
            一键生成 · 私有化部署
          </button>
          <button className="rounded-md border border-border px-5 py-2 text-xs hover:border-primary/40 hover:text-primary">
            下载白皮书
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ SECURITY ------------------------------ */
function Security() {
  const tabs = ["数据加密", "访问控制", "审计日志", "灾备方案"];
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          安全 — <span className="text-primary text-glow">我们最重视</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          从硬件、网络、数据到模型——SCIMate 内置完整安全栈。
        </p>
        <div className="relative mt-10 overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center scanline">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-destructive/50 bg-destructive/10">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <div className="mt-4 text-lg font-semibold">一键全栈授权</div>
          <p className="mt-2 text-xs text-muted-foreground">
            敏感任务一键关闭外网，全部由设备本地完成；策略变更全链路审计。
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((t, i) => (
            <button
              key={t}
              className={`rounded-md border px-4 py-1.5 text-xs ${
                i === 0
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ STATS ------------------------------ */
function Stats() {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          科研团队的<span className="text-primary text-glow">反馈</span>
        </h2>
        <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
            『使用 SCIMate 三个月，我们的论文产出效率提升了 300%，审稿周期、实验
            可复用性等关键指标全面优化了 42%。』
          </p>
          <div className="mt-4 text-xs text-primary">— 张教授，某 985 高校</div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { v: "+300%", l: "论文产出" },
            { v: "+40%", l: "审稿周期下降" },
            { v: "0", l: "数据泄漏" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-lg border border-border bg-card/40 p-6 text-center backdrop-blur-md"
            >
              <div className="text-3xl font-semibold text-primary text-glow">{s.v}</div>
              <div className="mt-2 text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ CTA ------------------------------ */
function CTA() {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">准备好开始了吗？</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          让 SCIMate 与你一起跑赢科研周期。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/workspace"
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground glow-primary hover:brightness-110"
          >
            立即体验
          </Link>
          <button className="rounded-md border border-border px-6 py-2.5 text-sm hover:border-primary/40 hover:text-primary">
            联系销售
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FOOTER ------------------------------ */
function Footer() {
  const cols = [
    { t: "产品", links: ["数据概览", "人机对话", "设备管理", "远控通道"] },
    { t: "解决方案", links: ["高校", "企业", "实验室"] },
    { t: "公司", links: ["关于我们", "新闻", "招聘"] },
    { t: "支持", links: ["文档", "API", "联系"] },
  ];
  return (
    <footer className="bg-background/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary glow-primary text-sm font-bold">
              S
            </div>
            <span className="text-base font-semibold">
              SCI<span className="text-primary text-glow">Mate</span>
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            让科研人省时，也让科研结果更可信。<br />
            Your Companion in Research Activities.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <div className="text-xs font-semibold">{c.t}</div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {c.links.map((l) => (
                <li key={l} className="hover:text-primary">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-6 py-5 text-center text-[11px] text-muted-foreground">
        © 2026 SCIMate · 保留所有权利
      </div>
    </footer>
  );
}
