import { ScrollArea } from "@/components/ui/scroll-area"

// LaTeX code lines with syntax highlighting data
const codeLines = [
  { num: 1, content: [{ type: "command", text: "\\documentclass" }, { type: "brace", text: "{" }, { type: "text", text: "article" }, { type: "brace", text: "}" }] },
  { num: 2, content: [] },
  { num: 3, content: [{ type: "command", text: "\\usepackage" }, { type: "brace", text: "{" }, { type: "text", text: "graphicx" }, { type: "brace", text: "}" }] },
  { num: 4, content: [{ type: "command", text: "\\usepackage" }, { type: "brace", text: "{" }, { type: "text", text: "amsmath" }, { type: "brace", text: "}" }] },
  { num: 5, content: [{ type: "command", text: "\\usepackage" }, { type: "brace", text: "{" }, { type: "text", text: "hyperref" }, { type: "brace", text: "}" }] },
  { num: 6, content: [] },
  { num: 7, content: [{ type: "command", text: "\\title" }, { type: "brace", text: "{" }, { type: "text", text: "My Research Paper" }, { type: "brace", text: "}" }] },
  { num: 8, content: [{ type: "command", text: "\\author" }, { type: "brace", text: "{" }, { type: "text", text: "Author Name" }, { type: "brace", text: "}" }] },
  { num: 9, content: [{ type: "command", text: "\\date" }, { type: "brace", text: "{" }, { type: "command", text: "\\today" }, { type: "brace", text: "}" }] },
  { num: 10, content: [] },
  { num: 11, content: [{ type: "command", text: "\\begin" }, { type: "brace", text: "{" }, { type: "text", text: "document" }, { type: "brace", text: "}" }] },
  { num: 12, content: [] },
  { num: 13, content: [{ type: "command", text: "\\maketitle" }] },
  { num: 14, content: [] },
  { num: 15, content: [{ type: "command", text: "\\section" }, { type: "brace", text: "{" }, { type: "text", text: "Introduction" }, { type: "brace", text: "}" }] },
  { num: 16, content: [{ type: "comment", text: "% Write your introduction here" }] },
  { num: 17, content: [] },
  { num: 18, content: [{ type: "command", text: "\\section" }, { type: "brace", text: "{" }, { type: "text", text: "Methods" }, { type: "brace", text: "}" }] },
  { num: 19, content: [{ type: "comment", text: "% Describe your methodology" }] },
  { num: 20, content: [] },
  { num: 21, content: [{ type: "command", text: "\\section" }, { type: "brace", text: "{" }, { type: "text", text: "Results" }, { type: "brace", text: "}" }] },
  { num: 22, content: [{ type: "comment", text: "% Present your findings" }] },
  { num: 23, content: [] },
  { num: 24, content: [{ type: "command", text: "\\end" }, { type: "brace", text: "{" }, { type: "text", text: "document" }, { type: "brace", text: "}" }] },
]

// Syntax highlighting colors using semantic tokens
const tokenColors: Record<string, string> = {
  command: "text-[color:var(--accent)]",
  brace: "text-[color:var(--warning)]",
  comment: "text-muted-foreground italic",
  text: "text-[color:var(--text-secondary)]",
}

export function CodePlaceholder() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 font-mono text-sm leading-relaxed">
        {codeLines.map((line) => (
          <div key={line.num} className="flex gap-4">
            <span className="w-8 text-right text-muted-foreground select-none">
              {line.num}
            </span>
            <span className="flex-1">
              {line.content.map((token, i) => (
                <span key={i} className={tokenColors[token.type]}>
                  {token.text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
