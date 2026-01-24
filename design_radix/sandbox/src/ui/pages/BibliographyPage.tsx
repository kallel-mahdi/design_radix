import * as Checkbox from "@radix-ui/react-checkbox";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useMemo, useState } from "react";

type Row = { id: string; title: string; authors: string; year: string; venue: string };

const rowsSeed: Row[] = [
  { id: "a", title: "Attention Is All You Need", authors: "Vaswani et al.", year: "2017", venue: "NeurIPS" },
  { id: "b", title: "Language Models are Few-Shot Learners", authors: "Brown et al.", year: "2020", venue: "NeurIPS" },
  { id: "c", title: "Rethinking Generalization in RL", authors: "Kirk et al.", year: "2021", venue: "ICML" }
];

export function BibliographyPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allChecked = useMemo(() => rowsSeed.length > 0 && rowsSeed.every((r) => selected[r.id]), [selected]);
  const someChecked = useMemo(() => rowsSeed.some((r) => selected[r.id]) && !allChecked, [selected, allChecked]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          background: "var(--card-bg)",
          boxShadow: "0 10px 30px var(--shadow-soft)",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "0.75rem" }}>
          <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>Library</div>
          <div style={{ color: "var(--text-secondary)" }}>Bibliography (Radix Checkbox + Tooltip)</div>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "44rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                <th style={thStyle}>
                  <Checkbox.Root
                    checked={allChecked ? true : someChecked ? "indeterminate" : false}
                    onCheckedChange={(v) => {
                      const next = v === true;
                      const map: Record<string, boolean> = {};
                      for (const r of rowsSeed) map[r.id] = next;
                      setSelected(map);
                    }}
                    style={checkboxRootStyle}
                  >
                    <Checkbox.Indicator style={checkboxIndicatorStyle}>✓</Checkbox.Indicator>
                  </Checkbox.Root>
                </th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Authors</th>
                <th style={thStyle}>Year</th>
                <th style={thStyle}>Venue</th>
                <th style={thStyle}>Files</th>
              </tr>
            </thead>
            <tbody>
              {rowsSeed.map((r) => {
                const isSelected = !!selected[r.id];
                return (
                  <tr
                    key={r.id}
                    style={{
                      background: isSelected ? "var(--selection)" : "transparent",
                      borderTop: "1px solid var(--border-subtle)"
                    }}
                  >
                    <td style={tdStyle}>
                      <Checkbox.Root
                        checked={isSelected}
                        onCheckedChange={(v) => setSelected((s) => ({ ...s, [r.id]: v === true }))}
                        style={checkboxRootStyle}
                      >
                        <Checkbox.Indicator style={checkboxIndicatorStyle}>✓</Checkbox.Indicator>
                      </Checkbox.Root>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{r.title}</td>
                    <td style={tdStyle}>{r.authors}</td>
                    <td style={tdStyle}>{r.year}</td>
                    <td style={tdStyle}>{r.venue}</td>
                    <td style={tdStyle}>
                      <Tooltip.Root delayDuration={200}>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            style={{
                              border: "1px solid var(--border-default)",
                              background: "var(--bg-secondary)",
                              color: "var(--accent-text)",
                              borderRadius: "var(--radius-sm)",
                              padding: "0.25rem 0.5rem",
                              cursor: "pointer"
                            }}
                          >
                            PDF
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            sideOffset={8}
                            style={{
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "var(--radius-md)",
                              padding: "0.5rem 0.625rem",
                              color: "var(--text-primary)",
                              boxShadow: "0 10px 24px var(--shadow-medium)"
                            }}
                          >
                            Attachment
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontWeight: 700,
  padding: "0.75rem",
  fontSize: "0.875rem",
  borderBottom: "1px solid var(--border-subtle)"
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--text-primary)"
};

const checkboxRootStyle: React.CSSProperties = {
  width: "1.125rem",
  height: "1.125rem",
  borderRadius: "0.35rem",
  border: "1px solid var(--border-default)",
  background: "var(--bg-secondary)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
};

const checkboxIndicatorStyle: React.CSSProperties = {
  color: "var(--accent-text)",
  fontSize: "0.875rem",
  lineHeight: 1
};
