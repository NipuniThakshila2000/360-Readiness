"use client";

import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type ViewMode = "individual" | "command" | "assessment" | "trends" | "reports" | "settings";
type ReadinessState = "ready" | "watch" | "degraded";

const stateColor: Record<ReadinessState, string> = {
  ready: "var(--green)",
  watch: "var(--amber)",
  degraded: "var(--red)"
};

const individualReadinessSummary = {
  readinessScore: 72,
  burnoutRisk: "Moderate",
  stressLoad: 68,
  cognitiveStability: 74,
  recoveryIndex: 61,
  trend: -4
};

const biometricSignals = [
  { label: "HRV", value: 58, confidence: "92%", data: [54, 57, 56, 60, 59, 58, 58] },
  { label: "Heart Rate", value: 82, confidence: "89%", data: [76, 78, 81, 80, 84, 83, 82] },
  { label: "Blink Variability", value: 64, confidence: "86%", data: [70, 68, 63, 62, 65, 66, 64] },
  { label: "Pupil Dilation", value: 71, confidence: "81%", data: [62, 66, 65, 69, 73, 72, 71] },
  { label: "Reaction Time", value: 77, confidence: "94%", data: [82, 80, 79, 78, 77, 76, 77] },
  { label: "Decision Latency", value: 69, confidence: "88%", data: [62, 65, 67, 71, 70, 68, 69] },
  { label: "Attention Drift", value: 43, confidence: "84%", data: [36, 39, 41, 46, 44, 45, 43] },
  { label: "Sleep Fatigue", value: 57, confidence: "79%", data: [50, 52, 55, 59, 58, 56, 57] }
];

const assessmentBreakdown = [
  { name: "BAT exhaustion", value: 64 },
  { name: "BAT mental distance", value: 46 },
  { name: "CBI personal strain", value: 58 },
  { name: "CBI work load", value: 66 },
  { name: "Response consistency", value: 82 }
];

const readinessTimeline = [
  { day: "Mon", readiness: 80, strain: 48, recovery: 66 },
  { day: "Tue", readiness: 77, strain: 52, recovery: 63 },
  { day: "Wed", readiness: 76, strain: 56, recovery: 61 },
  { day: "Thu", readiness: 70, strain: 67, recovery: 55 },
  { day: "Fri", readiness: 72, strain: 64, recovery: 60 },
  { day: "Sat", readiness: 74, strain: 58, recovery: 64 },
  { day: "Sun", readiness: 72, strain: 62, recovery: 61 }
];

const commandSummary = [
  ["Units Monitored", "18", "info"],
  ["Ready", "11", "ready"],
  ["Caution", "5", "watch"],
  ["Degraded", "2", "degraded"],
  ["Active Alerts", "7", "watch"],
  ["Avg Readiness", "76", "selected"]
];

const unitReadinessTable = [
  { id: "alpha", unitName: "Alpha Platoon", personnelCount: 42, readinessScore: 81, burnoutRisk: "Low", trend: "+3", alertLevel: "Normal", region: "North Sector", lastUpdate: "12 min ago", state: "ready" as ReadinessState },
  { id: "bravo", unitName: "Bravo Squad", personnelCount: 18, readinessScore: 66, burnoutRisk: "Moderate", trend: "-6", alertLevel: "Watch", region: "Zone 3", lastUpdate: "8 min ago", state: "watch" as ReadinessState },
  { id: "charlie", unitName: "Charlie Team", personnelCount: 27, readinessScore: 58, burnoutRisk: "High", trend: "-11", alertLevel: "Critical", region: "East Ridge", lastUpdate: "4 min ago", state: "degraded" as ReadinessState },
  { id: "delta", unitName: "Delta Support", personnelCount: 31, readinessScore: 74, burnoutRisk: "Moderate", trend: "+1", alertLevel: "Watch", region: "South Gate", lastUpdate: "20 min ago", state: "watch" as ReadinessState },
  { id: "echo", unitName: "Echo Medical", personnelCount: 22, readinessScore: 88, burnoutRisk: "Low", trend: "+5", alertLevel: "Normal", region: "Base Node", lastUpdate: "17 min ago", state: "ready" as ReadinessState }
];

const readinessMapMarkers = [
  { id: "alpha", label: "Alpha Platoon", callsign: "A", x: 30, y: 31, state: "ready" as ReadinessState, score: 81, kind: "friendly" },
  { id: "bravo", label: "Bravo Squad", callsign: "B", x: 62, y: 46, state: "watch" as ReadinessState, score: 66, kind: "watch" },
  { id: "charlie", label: "Charlie Team", callsign: "C", x: 76, y: 62, state: "degraded" as ReadinessState, score: 58, kind: "risk" },
  { id: "delta", label: "Delta Support", callsign: "D", x: 41, y: 69, state: "watch" as ReadinessState, score: 74, kind: "watch" },
  { id: "echo", label: "Echo Medical", callsign: "E", x: 52, y: 24, state: "ready" as ReadinessState, score: 88, kind: "friendly" }
];

const readinessClusters = [
  { label: "Recovery Gap", x: 55, y: 34, state: "watch" as ReadinessState },
  { label: "Stable Group", x: 34, y: 57, state: "ready" as ReadinessState },
  { label: "High Strain", x: 73, y: 39, state: "degraded" as ReadinessState }
];

const mapFacilities = [
  { label: "Command Post", x: 73, y: 16, state: "degraded" as ReadinessState },
  { label: "Comms Facility", x: 61, y: 26, state: "degraded" as ReadinessState },
  { label: "Medical Node", x: 43, y: 78, state: "ready" as ReadinessState },
  { label: "Airstrip", x: 54, y: 70, state: "watch" as ReadinessState }
];

const mapRouteDots = [
  [31, 35],
  [37, 39],
  [43, 43],
  [49, 47],
  [56, 51],
  [62, 55],
  [68, 59],
  [74, 62],
  [78, 66]
];

const heatPatches = [
  { x: 18, y: 14, w: 56, h: 28, level: "high", rotate: -14 },
  { x: 27, y: 12, w: 48, h: 25, level: "critical", rotate: 8 },
  { x: 77, y: 9, w: 72, h: 28, level: "high", rotate: -8 },
  { x: 19, y: 29, w: 44, h: 29, level: "critical", rotate: 18 },
  { x: 31, y: 47, w: 68, h: 34, level: "high", rotate: 18 },
  { x: 38, y: 53, w: 74, h: 38, level: "critical", rotate: -8 },
  { x: 48, y: 37, w: 50, h: 25, level: "moderate", rotate: 20 },
  { x: 56, y: 54, w: 78, h: 39, level: "critical", rotate: 7 },
  { x: 61, y: 47, w: 64, h: 30, level: "high", rotate: -17 },
  { x: 70, y: 24, w: 54, h: 26, level: "moderate", rotate: -18 },
  { x: 74, y: 65, w: 90, h: 43, level: "critical", rotate: -10 },
  { x: 82, y: 71, w: 88, h: 40, level: "high", rotate: 12 },
  { x: 31, y: 82, w: 72, h: 32, level: "moderate", rotate: 12 },
  { x: 50, y: 84, w: 64, h: 31, level: "high", rotate: -24 },
  { x: 86, y: 49, w: 66, h: 34, level: "critical", rotate: 16 },
  { x: 15, y: 70, w: 82, h: 39, level: "critical", rotate: -5 },
  { x: 21, y: 61, w: 54, h: 30, level: "high", rotate: 11 },
  { x: 64, y: 82, w: 80, h: 36, level: "high", rotate: 21 },
  { x: 8, y: 52, w: 46, h: 26, level: "moderate", rotate: -21 },
  { x: 91, y: 55, w: 54, h: 30, level: "high", rotate: 8 },
  { x: 68, y: 59, w: 58, h: 32, level: "moderate", rotate: -12 },
  { x: 44, y: 67, w: 50, h: 26, level: "high", rotate: 29 }
];

const alertFeed = [
  ["Zone 3", "Cognitive strain rising across two squads", "watch"],
  ["Charlie Team", "Readiness dropped 11 points in 72h", "degraded"],
  ["Bravo Squad", "Recovery index below command threshold", "watch"]
];

const trendComparisons = [
  { name: "Alpha", readiness: 81, strain: 38 },
  { name: "Bravo", readiness: 66, strain: 63 },
  { name: "Charlie", readiness: 58, strain: 76 },
  { name: "Delta", readiness: 74, strain: 54 },
  { name: "Echo", readiness: 88, strain: 29 }
];

function StatusBadge({ state, children }: { state: string; children: React.ReactNode }) {
  return <span className={`status ${state}`}>{children}</span>;
}

function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {meta ? <span className="micro">{meta}</span> : null}
    </div>
  );
}

function MetricCard({ label, value, state, trend }: { label: string; value: string | number; state: string; trend: string }) {
  const color = state === "ready" ? stateColor.ready : state === "watch" ? stateColor.watch : state === "degraded" ? stateColor.degraded : "var(--cyan)";
  const numeric = typeof value === "number" ? value : parseInt(String(value), 10) || 70;
  return (
    <div className="card metric">
      <div className="metric-top">
        <div className="metric-label">{label}</div>
        <StatusBadge state={state}>{trend}</StatusBadge>
      </div>
      <div className="metric-value">{value}</div>
      <div className="bar">
        <span style={{ width: `${Math.min(numeric, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function TrendSparklineCard({ item }: { item: (typeof biometricSignals)[number] }) {
  const data = item.data.map((value, index) => ({ index, value }));
  return (
    <div className="card chart-card">
      <div className="chart-title">
        <strong>{item.label}</strong>
        <span>{item.value} / confidence {item.confidence}</span>
      </div>
      <ResponsiveContainer width="100%" height={78}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${item.label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#36d6d0" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#36d6d0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="#36d6d0" fill={`url(#spark-${item.label})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AIChatPanel({ command = false }: { command?: boolean }) {
  const prompts = command
    ? ["Show downward units", "Compare Alpha and Bravo", "Risk near Zone 3", "Intervention queue"]
    : ["Explain my decline", "What should I do today?", "Signals changed most", "Past 7 day pattern"];
  return (
    <div className="card">
      <SectionHeader title={command ? "AI Investigation Panel" : "AI Guidance Panel"} meta="Decision support" />
      <div className="chat">
        <div className="message">
          {command
            ? "Aggregate readiness is stable overall, but Zone 3 shows a 72-hour deterioration pattern. No raw personal health data is exposed in this command view."
            : "Your readiness decline is most associated with higher decision latency, reduced recovery index, and elevated stress load over the last three sessions."}
        </div>
        <div className="prompt-row">
          {prompts.map((prompt) => (
            <button key={prompt} title={prompt}>{prompt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndividualView() {
  return (
    <div className="grid">
      <div className="grid individual-grid">
        <div className="grid">
          <MetricCard label="Current Readiness" value={individualReadinessSummary.readinessScore} state="watch" trend="-4 vs 7d" />
          <MetricCard label="Burnout Risk" value={individualReadinessSummary.burnoutRisk} state="watch" trend="Moderate" />
          <MetricCard label="Stress Load" value={individualReadinessSummary.stressLoad} state="watch" trend="+8%" />
          <MetricCard label="Cognitive Stability" value={individualReadinessSummary.cognitiveStability} state="ready" trend="+2%" />
          <MetricCard label="Recovery Index" value={individualReadinessSummary.recoveryIndex} state="watch" trend="-6%" />
          <div className="card pad">
            <div className="micro">Private data view</div>
            <h3>Why this score?</h3>
            <p className="metric-label">Recent strain increased while recovery markers stayed below baseline. Response consistency remains strong, so the recommendation is recovery-led rather than performance restriction.</p>
          </div>
        </div>

        <div className="grid">
          <SectionHeader title="Biometric And Behavioral Analysis" meta="Signals vs baseline" />
          <div className="grid assessment-grid">
            {biometricSignals.map((item) => (
              <TrendSparklineCard key={item.label} item={item} />
            ))}
          </div>
          <div className="card">
            <SectionHeader title="Assessment Breakdown" meta="BAT + CBI informed" />
            <div className="card pad">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={assessmentBreakdown}>
                  <CartesianGrid stroke="rgba(127,153,178,.12)" vertical={false} />
                  <XAxis dataKey="name" stroke="#8ea0b2" fontSize={10} interval={0} />
                  <YAxis stroke="#8ea0b2" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#0b121b", border: "1px solid rgba(127,153,178,.25)" }} />
                  <Bar dataKey="value" fill="#4da3ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="heatmap" aria-label="Question response heatmap">
                {Array.from({ length: 36 }).map((_, index) => {
                  const colors = ["rgba(94,225,133,.75)", "rgba(244,189,79,.75)", "rgba(255,100,109,.75)", "rgba(54,214,208,.65)"];
                  return <span key={index} className="heat-cell" style={{ background: colors[(index + Math.floor(index / 5)) % colors.length] }} />;
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <SectionHeader title="Recommendation Priority" meta="AI insight layer" />
            <div className="factor-list">
              <div className="factor"><StatusBadge state="watch">Today</StatusBadge> 18-minute guided decompression before next cognitive task block.</div>
              <div className="factor"><StatusBadge state="ready">Next 24h</StatusBadge> Maintain hydration and short recovery intervals after high-load sessions.</div>
              <div className="factor"><StatusBadge state="ai">Explainability</StatusBadge> Decision latency and recovery index are the top moved signals.</div>
            </div>
          </div>
          <AIChatPanel />
          <div className="card timeline">
            <SectionHeader title="Readiness Timeline" meta="7 days" />
            <ResponsiveContainer width="100%" height={205}>
              <LineChart data={readinessTimeline} margin={{ top: 15, right: 16, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(127,153,178,.12)" vertical={false} />
                <XAxis dataKey="day" stroke="#8ea0b2" fontSize={11} />
                <YAxis stroke="#8ea0b2" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0b121b", border: "1px solid rgba(127,153,178,.25)" }} />
                <Line type="monotone" dataKey="readiness" stroke="#5ee185" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="strain" stroke="#ff646d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recovery" stroke="#4da3ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterToolbar() {
  return (
    <div className="filters">
      {[
        ["Region", "All sectors"],
        ["Mission Type", "Active ops"],
        ["Echelon", "Platoon+"],
        ["Readiness", "Watch + degraded"]
      ].map(([label, value]) => (
        <div className="filter" key={label} title={`${label}: ${value}`}>
          <label>{label}</label>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function DataTable({ onSelect, selectedId }: { onSelect: (id: string) => void; selectedId: string }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Unit / Team</th>
            <th>Personnel</th>
            <th>Score</th>
            <th>Risk</th>
            <th>Trend</th>
            <th>Alert</th>
            <th>Region</th>
          </tr>
        </thead>
        <tbody>
          {unitReadinessTable.map((unit) => (
            <tr key={unit.id} onClick={() => onSelect(unit.id)} title={`Open ${unit.unitName} readiness profile`} style={{ outline: selectedId === unit.id ? "1px solid rgba(77,163,255,.35)" : undefined }}>
              <td>{unit.unitName}</td>
              <td>{unit.personnelCount}</td>
              <td>{unit.readinessScore}</td>
              <td>{unit.burnoutRisk}</td>
              <td>{unit.trend}</td>
              <td><StatusBadge state={unit.state}>{unit.alertLevel}</StatusBadge></td>
              <td>{unit.region}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="map-legend">
      <div className="legend-item" title="Stable readiness state"><span className="dot" style={{ background: stateColor.ready }} /> Ready / stable</div>
      <div className="legend-item" title="Rising strain or caution state"><span className="dot" style={{ background: stateColor.watch }} /> Watch / rising strain</div>
      <div className="legend-item" title="High-risk readiness state"><span className="dot" style={{ background: stateColor.degraded }} /> Degraded / high risk</div>
      <div className="legend-item" title="Currently selected unit"><span className="dot" style={{ background: "var(--blue)" }} /> Selected object</div>
    </div>
  );
}

function UnitInspectorDrawer({ selectedId }: { selectedId: string }) {
  const unit = unitReadinessTable.find((item) => item.id === selectedId) ?? unitReadinessTable[0];
  return (
    <div className="inspector">
      <SectionHeader title="Unit Strain Profile" meta="Aggregate only" />
      <div className="factor-list">
        <div className="row"><strong>{unit.unitName}</strong><StatusBadge state={unit.state}>{unit.alertLevel}</StatusBadge></div>
        <MetricCard label="Aggregate Readiness" value={unit.readinessScore} state={unit.state} trend={unit.trend} />
        <div className="factor">Personnel count: {unit.personnelCount}</div>
        <div className="factor">Sector: {unit.region}</div>
        <div className="factor">Top strain factors: recovery deficit, mission tempo, sleep debt.</div>
        <div className="factor">Leadership action suggested: schedule staggered recovery and reassess in 24 hours.</div>
        <ResponsiveContainer width="100%" height={86}>
          <LineChart data={readinessTimeline}>
            <Line type="monotone" dataKey="readiness" stroke="#4da3ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MapPanel({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ pointerId: number; x: number; y: number; panX: number; panY: number } | null>(null);
  const maxPan = Math.max(0, (zoom - 1) * 95);
  const clampedPan = {
    x: Math.max(-maxPan, Math.min(maxPan, pan.x)),
    y: Math.max(-maxPan, Math.min(maxPan, pan.y))
  };
  const personnel = useMemo(
    () =>
      Array.from({ length: 46 }).map((_, i) => ({
        x: 24 + ((i * 13) % 56),
        y: 19 + ((i * 19) % 56),
        state: (i % 9 === 0 ? "degraded" : i % 4 === 0 ? "watch" : "ready") as ReadinessState
      })),
    []
  );
  const updateZoom = (nextZoom: number) => {
    const normalizedZoom = Math.min(1.9, Math.max(1, nextZoom));
    setZoom(normalizedZoom);
    if (normalizedZoom === 1) {
      setPan({ x: 0, y: 0 });
    }
  };
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: clampedPan.x,
      panY: clampedPan.y
    };
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = dragStart.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const nextX = current.panX + event.clientX - current.x;
    const nextY = current.panY + event.clientY - current.y;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, nextX)),
      y: Math.max(-maxPan, Math.min(maxPan, nextY))
    });
  };
  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.pointerId === event.pointerId) {
      dragStart.current = null;
    }
  };
  return (
    <div className="card map-card">
      <SectionHeader title="Interactive Readiness Map" meta={`Zoom ${zoom.toFixed(1)}x / de-identified clusters`} />
      <div className="map-panel">
        <div className="map-tool-rail left">
          <button title="Layers">L</button>
          <button title="Signals">S</button>
          <button title="Grid">G</button>
          <button title="Measure">M</button>
        </div>
        <div className="map-tool-rail right">
          <button title="Alerts">!</button>
          <button title="Routes">R</button>
          <button title="Vitals">V</button>
          <button title="Chat">C</button>
        </div>
        <div className="map-controls">
          <button onClick={() => updateZoom(zoom + 0.2)}>+</button>
          <button onClick={() => updateZoom(zoom - 0.2)} disabled={zoom <= 1}>-</button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); updateZoom(1); }} title="Reset map">R</button>
        </div>
        <div
          className={`map-stage ${zoom > 1 ? "is-pannable" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          style={{ transform: `translate(${clampedPan.x}px, ${clampedPan.y}px) scale(${zoom})` }}
        >
          <div className="terrain-shade ridge-a" />
          <div className="terrain-shade ridge-b" />
          <div className="terrain-shade basin" />
          <svg className="satellite-layer" viewBox="0 0 1000 720" preserveAspectRatio="none" aria-hidden="true">
            <filter id="mapNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.018 0.045" numOctaves="4" seed="8" />
              <feColorMatrix type="saturate" values="0.55" />
              <feBlend mode="multiply" in2="SourceGraphic" />
            </filter>
            <g filter="url(#mapNoise)">
              <path className="sat-rock" d="M0 0H1000V720H0Z" />
              <path className="sat-sand" d="M150 0 C235 110 230 220 190 330 C142 462 198 582 265 720 L0 720 L0 0Z" />
              <path className="sat-ridge" d="M386 0 C470 92 515 202 492 315 C470 424 518 528 610 720 L1000 720 L1000 0Z" />
              <path className="sat-valley" d="M322 395 C400 360 492 382 560 442 C625 500 616 580 545 626 C480 670 374 642 312 585 C250 528 250 430 322 395Z" />
              <path className="sat-green" d="M0 235 C148 238 243 274 362 304 C532 346 706 305 1000 340 L1000 720 L0 720Z" />
              <path className="sat-green alt" d="M0 0H96 C132 155 114 280 86 405 C62 514 82 618 125 720 H0Z" />
            </g>
          </svg>
          <svg className="coverage-layer" viewBox="0 0 1000 720" preserveAspectRatio="none" aria-hidden="true">
            <path d="M18 86 C176 118 286 82 410 136 C540 194 668 190 968 152 L1000 720 L0 720 Z" />
            <path d="M0 360 C155 314 278 364 426 332 C570 302 738 322 1000 282 L1000 720 L0 720 Z" />
          </svg>
          <svg className="map-network" viewBox="0 0 1000 720" preserveAspectRatio="none" aria-hidden="true">
            <g className="network-fill">
              <path d="M0 90 C130 150 250 130 380 190 C520 255 660 205 1000 280 L1000 720 L0 720 Z" />
              <path d="M0 485 C185 430 325 485 500 425 C680 365 815 402 1000 350 L1000 720 L0 720 Z" />
            </g>
            <g className="network-lines">
              <path d="M65 0 C120 122 140 242 116 383 C98 495 132 600 210 720" />
              <path d="M242 0 C300 115 337 204 326 323 C315 452 365 596 430 720" />
              <path d="M505 0 C475 132 508 236 590 340 C674 448 692 560 650 720" />
              <path d="M780 0 C720 130 718 245 785 372 C840 478 860 592 850 720" />
              <path d="M0 175 C160 153 292 188 430 162 C595 130 746 160 1000 108" />
              <path d="M0 312 C118 286 218 312 333 358 C471 414 630 380 1000 426" />
              <path d="M0 530 C148 500 288 518 424 480 C596 432 762 485 1000 532" />
              <path d="M112 384 C242 318 358 304 485 230 C625 150 762 180 940 68" />
              <path d="M210 720 C286 602 380 535 510 510 C680 477 768 352 920 262" />
              <path d="M30 632 C190 598 292 612 420 655 C555 700 690 650 988 688" />
            </g>
            <g className="network-nodes">
              <circle cx="145" cy="365" r="11" />
              <circle cx="332" cy="356" r="10" />
              <circle cx="510" cy="512" r="11" />
              <circle cx="650" cy="385" r="10" />
              <circle cx="788" cy="530" r="11" />
              <circle cx="850" cy="196" r="10" />
            </g>
          </svg>
          <div className="heat-layer" aria-hidden="true">
            {heatPatches.map((patch, index) => (
              <span
                key={index}
                className={`heat-patch ${patch.level}`}
                style={{
                  left: `${patch.x}%`,
                  top: `${patch.y}%`,
                  width: patch.w,
                  height: patch.h,
                  transform: `translate(-50%, -50%) rotate(${patch.rotate}deg)`
                }}
              />
            ))}
          </div>
          <div className="range-ring outer" />
          <div className="range-ring inner" />
          <div className="threat-zone" />
          <div className="boundary-line" />
          <div className="route-line" />
          {mapRouteDots.map(([x, y], index) => (
            <span key={`${x}-${y}`} className="route-dot" style={{ left: `${x}%`, top: `${y}%` }} data-index={index} />
          ))}
          <div className="sector-label" style={{ left: "49%", top: "40%" }}>Streets / sector track</div>
          <div className="sector-label" style={{ left: "45%", top: "71%" }}>Airstrip</div>
          <div className="sector-label" style={{ left: "84%", top: "76%" }}>Power Plant</div>
          {mapFacilities.map((facility) => (
            <div key={facility.label} className={`facility ${facility.state}`} style={{ left: `${facility.x}%`, top: `${facility.y}%` }}>
              <span />
              <strong>{facility.label}</strong>
            </div>
          ))}
          {zoom < 1.25 &&
            readinessClusters.map((cluster) => (
              <div
                key={`${cluster.x}-${cluster.y}`}
                className={`mission-zone ${cluster.state}`}
                style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
                title="De-identified Personnel Cluster"
              >
                <span>{cluster.label}</span>
              </div>
            ))}
          {readinessMapMarkers.map((marker) => (
            <button
              key={marker.id}
              className={`marker unit ${marker.kind} ${selectedId === marker.id ? "active" : ""} ${marker.state === "degraded" ? "alert" : ""}`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={() => onSelect(marker.id)}
              title={`${marker.label} aggregate readiness ${marker.score}`}
            >
              <span>{marker.callsign}</span>
              <strong>{marker.label}</strong>
            </button>
          ))}
          {zoom >= 1.35 &&
            personnel.map((person, index) => (
              <span
                key={index}
                className="marker person"
                style={{ left: `${person.x}%`, top: `${person.y}%`, background: stateColor[person.state] }}
                title="Anonymized personnel marker"
              />
            ))}
        </div>
        <MapLegend />
        <UnitInspectorDrawer selectedId={selectedId} />
      </div>
    </div>
  );
}

function CommandView() {
  const [selectedId, setSelectedId] = useState("bravo");
  return (
    <div className="grid">
      <div className="grid command-grid">
        <div className="grid">
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {commandSummary.map(([label, value, state]) => (
              <MetricCard key={label} label={label} value={value} state={state} trend="Live" />
            ))}
          </div>
          <div className="card">
            <SectionHeader title="Operational Filters" meta="Cross-filter workspace" />
            <FilterToolbar />
          </div>
          <div className="card">
            <SectionHeader title="Aggregate Unit Readiness" meta="No raw private data" />
            <DataTable selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <AIChatPanel command />
          <div className="card">
            <SectionHeader title="Alert Feed" meta="Trend deterioration" />
            <div className="alert-list">
              {alertFeed.map(([title, body, state]) => (
                <div className="alert" key={title}>
                  <div className="row"><strong>{title}</strong><StatusBadge state={state}>{state}</StatusBadge></div>
                  <p className="metric-label">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MapPanel selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="bottom-panel">
        <div className="card pad">
          <SectionHeader title="Trend Comparison" meta="Readiness vs strain" />
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={trendComparisons}>
              <CartesianGrid stroke="rgba(127,153,178,.12)" vertical={false} />
              <XAxis dataKey="name" stroke="#8ea0b2" fontSize={11} />
              <YAxis stroke="#8ea0b2" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0b121b", border: "1px solid rgba(127,153,178,.25)" }} />
              <Bar dataKey="readiness" fill="#5ee185" radius={[4, 4, 0, 0]} />
              <Bar dataKey="strain" fill="#ff646d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <SectionHeader title="Risk Breakdown" meta="Unit aggregate" />
          <div className="factor-list">
            <div className="factor">High tempo exposure: 38%</div>
            <div className="factor">Recovery deficit: 31%</div>
            <div className="factor">Assessment volatility: 18%</div>
            <div className="factor">Model confidence: 0.86</div>
          </div>
        </div>
        <div className="card">
          <SectionHeader title="Intervention Queue" meta="Leadership actions" />
          <div className="factor-list">
            <div className="factor"><StatusBadge state="degraded">Priority</StatusBadge> Charlie Team recovery stand-down review.</div>
            <div className="factor"><StatusBadge state="watch">Watch</StatusBadge> Bravo Squad supervisor check-in.</div>
            <div className="factor"><StatusBadge state="ready">Stable</StatusBadge> Alpha Platoon maintain cadence.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssessmentView() {
  return (
    <div className="grid assessment-page">
      <div className="card pad">
        <SectionHeader title="Assessment Workspace" meta="BAT + CBI informed" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={assessmentBreakdown}>
            <CartesianGrid stroke="rgba(127,153,178,.12)" vertical={false} />
            <XAxis dataKey="name" stroke="#8ea0b2" fontSize={11} interval={0} />
            <YAxis stroke="#8ea0b2" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0b121b", border: "1px solid rgba(127,153,178,.25)" }} />
            <Bar dataKey="value" fill="#4da3ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <SectionHeader title="Response Heatmap" meta="Latest assessment" />
        <div className="heatmap assessment-heatmap" aria-label="Question response heatmap">
          {Array.from({ length: 72 }).map((_, index) => {
            const colors = ["rgba(94,225,133,.75)", "rgba(244,189,79,.75)", "rgba(255,100,109,.75)", "rgba(54,214,208,.65)"];
            return <span key={index} className="heat-cell" style={{ background: colors[(index + Math.floor(index / 5)) % colors.length] }} />;
          })}
        </div>
      </div>
      <AIChatPanel />
    </div>
  );
}

function TrendsView() {
  return (
    <div className="grid trends-page">
      <div className="card timeline">
        <SectionHeader title="Readiness Timeline" meta="7 days" />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={readinessTimeline} margin={{ top: 15, right: 16, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(127,153,178,.12)" vertical={false} />
            <XAxis dataKey="day" stroke="#8ea0b2" fontSize={11} />
            <YAxis stroke="#8ea0b2" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0b121b", border: "1px solid rgba(127,153,178,.25)" }} />
            <Line type="monotone" dataKey="readiness" stroke="#5ee185" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="strain" stroke="#ff646d" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="recovery" stroke="#4da3ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card pad">
        <SectionHeader title="Trend Comparison" meta="Readiness vs strain" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={trendComparisons}>
            <CartesianGrid stroke="rgba(127,153,178,.12)" vertical={false} />
            <XAxis dataKey="name" stroke="#8ea0b2" fontSize={11} />
            <YAxis stroke="#8ea0b2" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0b121b", border: "1px solid rgba(127,153,178,.25)" }} />
            <Bar dataKey="readiness" fill="#5ee185" radius={[4, 4, 0, 0]} />
            <Bar dataKey="strain" fill="#ff646d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="grid">
      <div className="card">
        <SectionHeader title="Reports" meta="Command summaries" />
        <div className="factor-list">
          <div className="factor"><StatusBadge state="ready">Ready</StatusBadge> Weekly aggregate readiness report prepared for Sector North.</div>
          <div className="factor"><StatusBadge state="watch">Draft</StatusBadge> Zone 3 strain review awaiting commander notes.</div>
          <div className="factor"><StatusBadge state="degraded">Priority</StatusBadge> Charlie Team intervention summary requires review.</div>
        </div>
      </div>
      <div className="card">
        <SectionHeader title="Aggregate Unit Readiness" meta="Report source data" />
        <DataTable selectedId="bravo" onSelect={() => undefined} />
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="grid settings-page">
      {[
        ["Privacy Mode", "Aggregate command view, no raw personal health data exposed."],
        ["Alert Thresholds", "Readiness below 60 or 7-day decline above 8 points creates a command alert."],
        ["Map Defaults", "Tactical basemap, readiness symbols, and de-identified clusters enabled."],
        ["Data Refresh", "Operational dashboard refreshes every 15 minutes in prototype mode."]
      ].map(([title, body]) => (
        <div className="card factor" key={title}>
          <strong>{title}</strong>
          <p className="metric-label">{body}</p>
        </div>
      ))}
    </div>
  );
}

function LeftNav({ view, setView }: { view: ViewMode; setView: (view: ViewMode) => void }) {
  const items = [
    ["individual", "◉", "My"],
    ["command", "⌖", "Cmd"],
    ["assessment", "▦", "Assess"],
    ["trends", "⌁", "Trend"],
    ["reports", "□", "Reports"],
    ["settings", "⚙", "Set"]
  ] as const;
  return (
    <nav className="left-nav" aria-label="Primary navigation">
      <div className="brand-mark" aria-label="CIQ logo">
        <img src="/ciq-logo.png" alt="CIQ" />
      </div>
      {items.map(([id, icon, label]) => (
        <button
          key={id}
          className={`nav-button ${id === view ? "active" : ""}`}
          onClick={() => setView(id)}
          title={id === "individual" ? "My Readiness" : id === "command" ? "CIQ Readiness" : label}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function TopStatusBar({ view }: { view: ViewMode }) {
  const titles: Record<ViewMode, [string, string]> = {
    individual: ["My Readiness 360", "Private cognitive readiness view"],
    command: ["CIQ Readiness", "Aggregate operational readiness picture"],
    assessment: ["Assessment Workspace", "Assessment and response analysis"],
    trends: ["Readiness Trends", "Longitudinal readiness and strain patterns"],
    reports: ["Readiness Reports", "Command reporting workspace"],
    settings: ["System Settings", "Prototype configuration"]
  };
  return (
    <header className="top-bar">
      <div className="title-block">
        <h1>{titles[view][0]}</h1>
        <p>{titles[view][1]}</p>
      </div>
      <div className="top-actions">
        <span className="pill">TS/SCI Prototype</span>
        <span className="pill">{view === "individual" ? "Operator N. Silva" : "Sector North / Operation Sentinel"}</span>
        <select className="select" defaultValue="7d" aria-label="Time range">
          <option value="24h">Last 24h</option>
          <option value="72h">Last 72h</option>
          <option value="7d">Last 7 days</option>
        </select>
        <button className="icon-button" title="Notifications">!</button>
      </div>
    </header>
  );
}

export default function Home() {
  const [view, setView] = useState<ViewMode>("command");
  const activeView =
    view === "individual" ? <IndividualView /> :
    view === "command" ? <CommandView /> :
    view === "assessment" ? <AssessmentView /> :
    view === "trends" ? <TrendsView /> :
    view === "reports" ? <ReportsView /> :
    <SettingsView />;
  return (
    <main className="app-shell">
      <LeftNav view={view} setView={setView} />
      <section className="workspace">
        <TopStatusBar view={view} />
        <div className="content">
          <div className="view-switch" role="tablist" aria-label="Readiness workspaces">
            <button className={`switch-button ${view === "individual" ? "active" : ""}`} onClick={() => setView("individual")}>My Readiness</button>
            <button className={`switch-button ${view === "command" ? "active" : ""}`} onClick={() => setView("command")}>CIQ Readiness</button>
          </div>
          {activeView}
        </div>
      </section>
    </main>
  );
}
