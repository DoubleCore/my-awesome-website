import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, FileStack, ExternalLink } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { KnowledgeGraph } from "@/components/dashboard/KnowledgeGraph";
import { PipelineRuns } from "@/components/dashboard/PipelineRuns";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "SCIMate · 数据概览" },
      { name: "description", content: "科研流水线与健康度一屏掌握的工作台仪表盘" },
    ],
  }),
});

function Dashboard() {
  return (
    <div className="min-h-screen text-foreground">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>workspace</span>
                <span>/</span>
                <span>overview</span>
                <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  prod
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                科研流水线与健康度一屏掌握；图谱为示意数据,非实时生产负载。
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-md border border-border px-3 py-1.5">
                <span className="text-muted-foreground">env </span>
                <span className="text-primary">bc-demo</span>
              </span>
              <span className="rounded-md border border-border px-3 py-1.5">
                <span className="text-muted-foreground">region </span>
                <span className="text-primary">cn-east-1</span>
              </span>
              <button className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 hover:text-primary">
                设备 <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <StatCard
              label="Papers analyzed"
              sub="Today · UTC+8"
              value="184"
              delta="+12.4% vs yesterday"
              icon={FileStack}
            />
            <StatCard
              label="Simulation success rate"
              sub="Rolling 7d · SciSim"
              value="94.2%"
              delta="+0.8 pts"
              icon={FlaskConical}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
            <KnowledgeGraph />
            <PipelineRuns />
          </div>
        </main>
      </div>
    </div>
  );
}
