import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";

export function EditorPage() {
  const [left, setLeft] = useState(55);

  return (
    <section
      style={{
        height: "70vh",
        minHeight: "28rem",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        background: "var(--card-bg)",
        boxShadow: "0 10px 30px var(--shadow-soft)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "0.75rem" }}>
        <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>Editor</div>
        <div style={{ color: "var(--text-secondary)" }}>Radix Tabs + split panes</div>
      </div>

      <Tabs.Root defaultValue="main" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <Tabs.List
          style={{
            display: "flex",
            gap: "0.25rem",
            padding: "0.5rem 0.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-secondary)"
          }}
        >
          <Tab value="main">Main.tex</Tab>
          <Tab value="refs">refs.bib</Tab>
        </Tabs.List>

        <Tabs.Content value="main" style={{ flex: 1, minHeight: 0 }}>
          <Split leftPercent={left} onLeftPercentChange={setLeft} />
        </Tabs.Content>
        <Tabs.Content value="refs" style={{ flex: 1, minHeight: 0 }}>
          <Split leftPercent={left} onLeftPercentChange={setLeft} />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}

function Tab(props: { value: string; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={props.value}
      style={{
        border: "1px solid transparent",
        background: "transparent",
        color: "var(--text-secondary)",
        padding: "0.4rem 0.6rem",
        borderRadius: "0.6rem",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "0.875rem"
      }}
    >
      {props.children}
    </Tabs.Trigger>
  );
}

function Split(props: { leftPercent: number; onLeftPercentChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <div style={{ width: `${props.leftPercent}%`, borderRight: "1px solid var(--border-subtle)", minHeight: 0 }}>
        <div style={{ padding: "0.75rem", height: "100%", minHeight: 0, background: "var(--bg-canvas)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>LaTeX editor surface</div>
          <div style={{ marginTop: "0.75rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.875rem" }}>
            <div>\u005cdocumentclass\u007barticle\u007d</div>
            <div>\u005cbegin\u007bdocument\u007d</div>
            <div>\u005csection\u007bIntro\u007d</div>
            <div>...</div>
            <div>\u005cend\u007bdocument\u007d</div>
          </div>
        </div>
      </div>

      <div style={{ width: `${100 - props.leftPercent}%`, minHeight: 0 }}>
        <div style={{ padding: "0.75rem", height: "100%", minHeight: 0, background: "var(--bg-secondary)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>PDF preview surface</div>
          <div style={{ marginTop: "0.75rem" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 700 }}>
              Split
            </label>
            <input
              type="range"
              min={35}
              max={75}
              value={props.leftPercent}
              onChange={(e) => props.onLeftPercentChange(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
