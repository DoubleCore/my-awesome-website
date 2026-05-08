import { Activity } from "lucide-react";

const runs = [
  { id: "run_7f2a9c", pipe: "scifetch → scisummary →…", trig: "schedule", started: "2m ago", dur: "4m 12s" },
  { id: "run_8b11de", pipe: "full pipeline · peg-in-hole", trig: "api", started: "14m ago", dur: "11m 03s" },
  { id: "run_3c90aa", pipe: "sciact · bingo-claw session", trig: "manual", started: "32m ago", dur: "—" },
  { id: "run_1d44ef", pipe: "kg1 incremental rebuild", trig: "webhook", started: "1h ago", dur: "48s" },
  { id: "run_9e22ab", pipe: "scisim batch · suite v3", trig: "schedule", started: "2h ago", dur: "2m 51s" },
];

const trigColor: Record<string, string> = {
  schedule: "text-primary",
  api: "text-chart-4",
  manual: "text-muted-foreground",
  webhook: "text-foreground",
};

export function PipelineRuns() {
  return (
    <div className="panel flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide">Recent pipeline runs</h3>
        </div>
        <button className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
          View all
        </button>
      </div>

      <div className="flex-1 overflow-x-auto rounded-md border border-border/60 bg-background/50">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <tr className="border-b border-border/60">
              <th className="px-4 py-3 text-left">run</th>
              <th className="px-4 py-3 text-left">pipeline</th>
              <th className="px-4 py-3 text-left">trigger</th>
              <th className="px-4 py-3 text-left">started</th>
              <th className="px-4 py-3 text-left">dur</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-b border-border/30 hover:bg-primary/5">
                <td className="px-4 py-3 font-mono text-foreground">{r.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.pipe}</td>
                <td className={`px-4 py-3 ${trigColor[r.trig]}`}>{r.trig}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.started}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.dur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Showing 5 runs · auto-refresh off
      </div>
    </div>
  );
}
