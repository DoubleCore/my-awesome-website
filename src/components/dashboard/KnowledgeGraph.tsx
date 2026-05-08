import { Activity } from "lucide-react";

const nodes = [
  { id: "Paper", x: 90, y: 220, r: 18 },
  { id: "SciFetch", x: 230, y: 150, r: 28 },
  { id: "SciSummary", x: 380, y: 200, r: 32 },
  { id: "Dataset", x: 200, y: 320, r: 18 },
  { id: "SciSim", x: 380, y: 360, r: 28 },
  { id: "Report", x: 280, y: 460, r: 16 },
  { id: "KG1", x: 560, y: 240, r: 24 },
  { id: "SciAct", x: 560, y: 410, r: 20 },
];

const edges: [string, string][] = [
  ["Paper", "SciFetch"],
  ["SciFetch", "SciSummary"],
  ["SciSummary", "KG1"],
  ["Dataset", "SciSummary"],
  ["Dataset", "SciSim"],
  ["SciSim", "KG1"],
  ["SciSim", "SciAct"],
  ["Report", "SciSim"],
  ["Paper", "Dataset"],
];

const byId = (id: string) => nodes.find((n) => n.id === id)!;

export function KnowledgeGraph() {
  return (
    <div className="panel relative overflow-hidden p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide">Knowledge graph</h3>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          mock · read-only
        </div>
      </div>

      <div className="rounded-md border border-border/60 bg-background/50 p-4">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>
            graph{" "}
            <span className="ml-2 rounded bg-primary/15 px-2 py-0.5 text-primary">
              kg1 / production
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            live · v2.4.1
          </span>
        </div>

        <svg viewBox="0 0 680 540" className="h-[440px] w-full">
          <defs>
            <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.82 0.18 165)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="oklch(0.82 0.18 165)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {edges.map(([a, b], i) => {
            const A = byId(a);
            const B = byId(b);
            return (
              <g key={i}>
                <line
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  stroke="oklch(0.82 0.18 165 / 0.25)" strokeWidth={1}
                />
                <line
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  stroke="oklch(0.82 0.18 165 / 0.9)" strokeWidth={1.2}
                  className="dash-pulse"
                />
              </g>
            );
          })}

          {nodes.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={n.r + 14} fill="url(#nodeGrad)" />
              <circle
                cx={n.x} cy={n.y} r={n.r}
                fill="oklch(0.18 0.025 180)"
                stroke="oklch(0.82 0.18 165)" strokeWidth={1.5}
              />
              <circle
                cx={n.x} cy={n.y} r={n.r - 5}
                fill="none"
                stroke="oklch(0.82 0.18 165 / 0.5)" strokeWidth={1}
              />
              <text
                x={n.x} y={n.y + n.r + 18}
                textAnchor="middle"
                className="fill-foreground"
                style={{ font: "12px ui-monospace, monospace" }}
              >
                {n.id}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>nodes <span className="text-foreground">8</span></span>
          <span>edges <span className="text-foreground">8</span></span>
          <span>last sync <span className="text-foreground">2m ago</span></span>
        </div>
      </div>
    </div>
  );
}
