import { Database, History, Radar, ShieldCheck } from "lucide-react";

const items = [
  { id: "radar", label: "Radar", Icon: Radar },
  { id: "replay", label: "Replay", Icon: History },
  { id: "sources", label: "Sources", Icon: Database },
];

export function Sidebar({ activeView, onChange, model }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <button className="brand" onClick={() => onChange("radar")} aria-label="Open Support Gap Radar">
        <span className="brand-mark"><Radar size={22} strokeWidth={1.9} /></span>
        <span>Support Gap<br />Radar</span>
      </button>

      <nav className="nav-list">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? "is-active" : ""}`}
            onClick={() => onChange(id)}
            aria-current={activeView === id ? "page" : undefined}
          >
            <Icon size={21} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-model" title="Model used for coverage judgment">
        <ShieldCheck size={17} strokeWidth={1.8} />
        <span>{model || "gpt-5.6"}</span>
      </div>
    </aside>
  );
}
