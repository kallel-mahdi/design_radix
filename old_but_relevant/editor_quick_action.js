// ============================================
// DIFF VISUALIZATION DEMO - JavaScript
// Enhanced: 6 Diff Styles × 2 Content Types
// All 5 Change Types in Each Demo
// ============================================

// Current state (2D: content × style)
let currentContentType = 'paragraph';
let currentDiffStyle = 'view-zone';

// ============================================
// DIFF STYLE CONFIGURATIONS
// ============================================
const diffStyles = {
  'view-zone': {
    name: 'Style 1: View Zone',
    description: 'Original stays in place. AI suggestion appears in a dedicated block below with old/new separated.',
  },
  'inline': {
    name: 'Style 2: Inline Interleaved',
    description: 'Strikethrough old + new text on the same line. Compact but can get cluttered with big changes.',
  },
  'split': {
    name: 'Style 3: Split View Zone',
    description: 'Old section on top, new section below in one block. Good for comparing multi-line changes.',
  },
  'hybrid': {
    name: 'Style 4: Hybrid Surgical',
    description: 'Unchanged text stays normal, only specific changed words are highlighted inline.',
  },
  'gdocs': {
    name: 'Style 5: Google Docs',
    description: 'Green underlined additions, red strikethrough deletions, margin comment box for context.',
  },
  'cursor': {
    name: 'Style 6: Cursor Chunks',
    description: 'Alternating red/green blocks for hunks with per-hunk accept/reject buttons.',
  },
  'ghost': {
    name: 'Style 7: Ghost Text',
    description: 'Faint inline preview of replacement. Tab to accept, Esc to dismiss. Best for micro-edits.',
  },
  'draft': {
    name: 'Style 8: Draft Preview',
    description: 'New text shown first with "Show diff" to expand comparison. Good for paragraph rewrites.',
  },
};

// Change counts for summary line
const changeCounts = {
  paragraph: { replacements: 2, deletions: 1, additions: 1, moved: 1 },
  latex: { replacements: 2, deletions: 1, additions: 3, moved: 1 },
};

// ============================================
// DEMO CONTENT: PARAGRAPH REWRITE
// Shows all 5 change types: unchanged, replacement, deletion, addition, moved
// ============================================
const paragraphContent = {
  // Original text (3 sentences)
  original: `Machine learning models require significant computational resources for training. The optimization process is often slow and inefficient. Researchers have proposed various techniques to address this challenge.`,

  // Original text for display
  originalDisplay: `<span class="code-comment">Machine learning models require significant computational resources for training. The optimization process is often slow and inefficient. Researchers have proposed various techniques to address this challenge.</span>`,

  // For VIEW ZONE style - clear old/new sections with labels
  viewZone: {
    old: `<div class="vz-section-label">Original:</div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem;">
      <span class="diff-old-text">Machine learning models require <strong>significant</strong> computational resources for training.</span>
    </div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem;">
      <span class="diff-old-text">The optimization process is <strong>often</strong> slow <strong>and inefficient</strong>.</span>
      <span style="font-size: 0.625rem; color: var(--accent-error); margin-left: 0.5rem;">← "and inefficient" deleted</span>
    </div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem;">
      <span class="diff-old-text">Researchers have proposed various techniques to address this challenge.</span>
      <span style="font-size: 0.625rem; color: var(--accent-violet); margin-left: 0.5rem;">← moved ↑</span>
    </div>`,
    new: `<div class="vz-section-label" style="margin-top: 0.75rem;">Modified:</div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem;">
      <span class="diff-new-text" style="color: var(--accent-violet);">Researchers have proposed various techniques to improve efficiency.</span>
      <span class="move-indicator">↑ moved & edited</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem;">
      <span class="diff-new-text">Machine learning models require <strong>substantial</strong> computational resources for training.</span>
      <span style="font-size: 0.625rem; color: var(--accent-success); margin-left: 0.5rem;">significant → substantial</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem;">
      <span class="diff-new-text">The optimization process is <strong>frequently</strong> slow.</span>
      <span style="font-size: 0.625rem; color: var(--accent-success); margin-left: 0.5rem;">often → frequently, deleted "and inefficient"</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem;">
      <span class="diff-new-text"><em>Recent advances in hardware acceleration have enabled faster iteration cycles.</em></span>
      <span style="font-size: 0.625rem; color: var(--accent-success); margin-left: 0.5rem;">+ new sentence</span>
    </div>`,
  },

  // For INLINE style - strikethrough + new on same line
  inline: `<span class="diff-inline-old">Machine learning models require significant</span><span class="diff-inline-new">Machine learning models require substantial</span> computational resources for training.<br>
<span class="diff-inline-old">The optimization process is often slow and inefficient.</span><span class="diff-inline-new">The optimization process is frequently slow.</span><br>
<span class="diff-inline-old">Researchers have proposed various techniques to address this challenge.</span><br>
<span class="diff-inline-new"><span class="word-moved">Researchers have proposed various techniques</span> to improve efficiency.</span> <span class="move-indicator">↑ moved</span><br>
<span class="diff-inline-new">Recent advances in hardware acceleration have enabled faster iteration cycles.</span> <span style="font-size: 0.625rem; color: var(--accent-success);">+ new</span>`,

  // For SPLIT style - old section on top, new below
  split: {
    old: `<div style="color: var(--accent-error); text-decoration: line-through; opacity: 0.8; margin-bottom: 0.125rem;">Machine learning models require <strong>significant</strong> computational resources for training.</div>
<div style="color: var(--accent-error); text-decoration: line-through; opacity: 0.8; margin-bottom: 0.125rem;">The optimization process is <strong>often</strong> slow <strong>and inefficient</strong>.</div>
<div style="color: var(--accent-violet); text-decoration: line-through; opacity: 0.8;">Researchers have proposed various techniques to address this challenge. <em style="font-size: 0.625rem;">↑ moved</em></div>`,
    new: `<div style="color: var(--accent-violet); margin-bottom: 0.125rem;">Researchers have proposed various techniques to improve efficiency. <em style="font-size: 0.625rem;">↓ moved here</em></div>
<div style="color: var(--accent-success); margin-bottom: 0.125rem;">Machine learning models require <strong>substantial</strong> computational resources for training.</div>
<div style="color: var(--accent-success); margin-bottom: 0.125rem;">The optimization process is <strong>frequently</strong> slow.</div>
<div style="color: var(--accent-success);">Recent advances in hardware acceleration have enabled faster iteration cycles. <em style="font-size: 0.625rem;">+ new</em></div>`,
  },

  // For HYBRID (surgical) style - only changed words highlighted
  hybrid: `Machine learning models require <span class="word-change"><span class="word-removed">significant</span><span class="word-added">substantial</span></span> computational resources for training. The optimization process is <span class="word-change"><span class="word-removed">often</span><span class="word-added">frequently</span></span> slow<span class="word-removed"> and inefficient</span>. <span class="word-moved">Researchers have proposed various techniques</span> to <span class="word-change"><span class="word-removed">address this challenge</span><span class="word-added">improve efficiency</span></span>. <span class="word-added">Recent advances in hardware acceleration have enabled faster iteration cycles.</span>`,

  // For GDOCS style - green underlined additions, red strikethrough deletions
  gdocs: `<span class="gdocs-moved">Researchers have proposed various techniques</span> to <span class="gdocs-deleted">address this challenge</span><span class="gdocs-added">improve efficiency</span>. Machine learning models require <span class="gdocs-deleted">significant</span><span class="gdocs-added">substantial</span> computational resources for training. The optimization process is <span class="gdocs-deleted">often</span><span class="gdocs-added">frequently</span> slow<span class="gdocs-deleted"> and inefficient</span>. <span class="gdocs-added">Recent advances in hardware acceleration have enabled faster iteration cycles.</span>`,
  gdocsComment: 'Rewrote for clarity: replaced "significant" → "substantial", "often" → "frequently", removed redundant "and inefficient", moved context sentence to start, added note about hardware advances.',

  // For CURSOR style (chunks) - alternating red/green blocks
  cursor: `<div class="cursor-hunk-moved">
  <div class="hunk-line">↕ Researchers have proposed various techniques to improve efficiency.</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(0)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(0)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-context">
  <div class="hunk-line">Machine learning models require</div>
</div>
<div class="cursor-hunk-removed">
  <div class="hunk-line">significant</div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">substantial</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(1)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(1)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-context">
  <div class="hunk-line">computational resources for training. The optimization process is</div>
</div>
<div class="cursor-hunk-removed">
  <div class="hunk-line">often slow and inefficient.</div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">frequently slow.</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(2)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(2)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">Recent advances in hardware acceleration have enabled faster iteration cycles.</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(3)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(3)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>`,

  // For GHOST style - faint inline replacement (micro-edit example: just one word)
  ghost: `Machine learning models require <span class="ghost-original">significant</span><span class="ghost-text">substantial</span> computational resources for training.`,

  // For DRAFT style - new text preview + expandable comparison
  draft: {
    preview: `Researchers have proposed various techniques to improve efficiency. Machine learning models require substantial computational resources for training. The optimization process is frequently slow. Recent advances in hardware acceleration have enabled faster iteration cycles.`,
    comparison: `<div class="comparison-label">Original:</div>
<div class="comparison-old">Machine learning models require significant computational resources for training. The optimization process is often slow and inefficient. Researchers have proposed various techniques to address this challenge.</div>
<div class="comparison-label" style="margin-top: 0.75rem;">Suggested:</div>
<div class="comparison-new">Researchers have proposed various techniques to improve efficiency. Machine learning models require substantial computational resources for training. The optimization process is frequently slow. Recent advances in hardware acceleration have enabled faster iteration cycles.</div>`,
  },
};

// ============================================
// DEMO CONTENT: LATEX CODE FIX
// Shows all 5 change types: unchanged, replacement, deletion, addition, moved
// Original has: \begin{figure}, \includegraphics, \label, \caption, \end{figure}
// Fixed version: adds [htbp], \centering, [width=\textwidth], better path,
//                removes redundant comment line, moves \label before \caption
// ============================================
const latexContent = {
  // Original text (each command on its own line - LaTeX best practice)
  original: `\\begin{figure}
  \\includegraphics{image.png}
  % TODO: add label
  \\caption{Results}
\\end{figure}`,

  // Original display
  originalDisplay: `<span class="code-command">\\begin</span><span class="code-brace">{</span>figure<span class="code-brace">}</span>
  <span class="code-command">\\includegraphics</span><span class="code-brace">{</span>image.png<span class="code-brace">}</span>
  <span class="code-comment">% TODO: add label</span>
  <span class="code-command">\\caption</span><span class="code-brace">{</span>Results<span class="code-brace">}</span>
<span class="code-command">\\end</span><span class="code-brace">{</span>figure<span class="code-brace">}</span>`,

  // For VIEW ZONE style - each line separate, clear labels for changes
  viewZone: {
    old: `<div class="vz-section-label">Original:</div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-old-text">\\begin{figure}</span>
    </div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-old-text">  \\includegraphics{image.png}</span>
    </div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-old-text">  % TODO: add label</span>
      <span style="font-size: 0.625rem; color: var(--accent-error); margin-left: 0.5rem;">← deleted</span>
    </div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-old-text">  \\caption{Results}</span>
    </div>
    <div class="diff-old" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-old-text">\\end{figure}</span>
    </div>`,
    new: `<div class="vz-section-label" style="margin-top: 0.75rem;">Modified:</div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-new-text">\\begin{figure}[htbp]</span>
      <span style="font-size: 0.625rem; color: var(--accent-success); margin-left: 0.5rem;">+ [htbp]</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-new-text">  \\centering</span>
      <span style="font-size: 0.625rem; color: var(--accent-success); margin-left: 0.5rem;">+ new</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-new-text">  \\includegraphics[width=\\textwidth]{figures/results.pdf}</span>
      <span style="font-size: 0.625rem; color: var(--accent-success); margin-left: 0.5rem;">+ options, path changed</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-new-text" style="color: var(--accent-violet);">  \\label{fig:results}</span>
      <span class="move-indicator">↑ added (was TODO)</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-new-text">  \\caption{Experimental results.}</span>
      <span style="font-size: 0.625rem; color: var(--accent-success); margin-left: 0.5rem;">expanded</span>
    </div>
    <div class="diff-new" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace;">
      <span class="diff-new-text">\\end{figure}</span>
      <span style="font-size: 0.625rem; color: var(--text-muted); margin-left: 0.5rem;">unchanged</span>
    </div>`,
  },

  // For INLINE style - each command on its own line with <br>
  inline: `<span class="diff-inline-old">\\begin{figure}</span><span class="diff-inline-new">\\begin{figure}[htbp]</span><br>
<span class="diff-inline-new">  \\centering</span><br>
<span class="diff-inline-old">  \\includegraphics{image.png}</span><span class="diff-inline-new">  \\includegraphics[width=\\textwidth]{figures/results.pdf}</span><br>
<span class="diff-inline-old" style="opacity: 0.5;">  % TODO: add label</span> <span style="font-size: 0.625rem; color: var(--accent-error);">← deleted</span><br>
<span class="diff-inline-new" style="color: var(--accent-violet);">  \\label{fig:results}</span><br>
<span class="diff-inline-old">  \\caption{Results}</span><span class="diff-inline-new">  \\caption{Experimental results.}</span><br>
<span style="color: var(--text-muted);">\\end{figure}</span>`,

  // For SPLIT style - clear old/new sections
  split: {
    old: `<div style="color: var(--text-secondary); margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">\\begin{figure}</div>
<div style="color: var(--accent-error); text-decoration: line-through; opacity: 0.8; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">  \\includegraphics{image.png}</div>
<div style="color: var(--accent-error); text-decoration: line-through; opacity: 0.8; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">  % TODO: add label</div>
<div style="color: var(--accent-error); text-decoration: line-through; opacity: 0.8; margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">  \\caption{Results}</div>
<div style="color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;">\\end{figure}</div>`,
    new: `<div style="color: var(--accent-success); margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">\\begin{figure}<strong>[htbp]</strong></div>
<div style="color: var(--accent-success); margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">  \\centering <em style="font-size: 0.625rem;">← new</em></div>
<div style="color: var(--accent-success); margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">  \\includegraphics<strong>[width=\\textwidth]</strong>{figures/results.pdf}</div>
<div style="color: var(--accent-violet); margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">  \\label{fig:results} <em style="font-size: 0.625rem;">← replaces TODO</em></div>
<div style="color: var(--accent-success); margin-bottom: 0.125rem; font-family: 'JetBrains Mono', monospace;">  \\caption{Experimental results.}</div>
<div style="color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;">\\end{figure}</div>`,
  },

  // For HYBRID (surgical) style - word-level inline changes
  hybrid: `\\begin{figure}<span class="word-added">[htbp]</span>
  <span class="word-added">\\centering</span>
  \\includegraphics<span class="word-added">[width=\\textwidth]</span>{<span class="word-change"><span class="word-removed">image.png</span><span class="word-added">figures/results.pdf</span></span>}
  <span class="word-removed">% TODO: add label</span>
  <span class="word-added">\\label{fig:results}</span>
  \\caption{<span class="word-change"><span class="word-removed">Results</span><span class="word-added">Experimental results.</span></span>}
\\end{figure}`,

  // For GDOCS style - green additions, red strikethrough, purple moved
  gdocs: `\\begin{figure}<span class="gdocs-added">[htbp]</span>
  <span class="gdocs-added">\\centering</span>
  \\includegraphics<span class="gdocs-added">[width=\\textwidth]</span>{<span class="gdocs-deleted">image.png</span><span class="gdocs-added">figures/results.pdf</span>}
  <span class="gdocs-deleted">% TODO: add label</span>
  <span class="gdocs-added">\\label{fig:results}</span>
  \\caption{<span class="gdocs-deleted">Results</span><span class="gdocs-added">Experimental results.</span>}
\\end{figure}`,
  gdocsComment: 'Fixed figure: added [htbp] positioning, \\centering, width option, better file path, replaced TODO comment with actual \\label, expanded caption.',

  // For CURSOR style (chunks) - each change as a separate hunk
  cursor: `<div class="cursor-hunk-context">
  <div class="hunk-line">\\begin{figure}</div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">[htbp]</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(0)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(0)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">  \\centering</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(1)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(1)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-removed">
  <div class="hunk-line">  \\includegraphics{image.png}</div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">  \\includegraphics[width=\\textwidth]{figures/results.pdf}</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(2)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(2)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-removed">
  <div class="hunk-line">  % TODO: add label</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(3)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(3)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">  \\label{fig:results}</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(4)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(4)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-removed">
  <div class="hunk-line">  \\caption{Results}</div>
</div>
<div class="cursor-hunk-added">
  <div class="hunk-line">  \\caption{Experimental results.}</div>
  <div class="cursor-hunk-actions">
    <button class="cursor-hunk-btn accept" onclick="acceptHunk(5)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>Accept</button>
    <button class="cursor-hunk-btn reject" onclick="rejectHunk(5)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
  </div>
</div>
<div class="cursor-hunk-context">
  <div class="hunk-line">\\end{figure}</div>
</div>`,

  // For GHOST style - faint inline replacement (micro-edit: path change)
  ghost: `\\includegraphics{<span class="ghost-original">image.png</span><span class="ghost-text">figures/results.pdf</span>}`,

  // For DRAFT style - new text preview + expandable comparison
  draft: {
    preview: `\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=\\textwidth]{figures/results.pdf}
  \\label{fig:results}
  \\caption{Experimental results.}
\\end{figure}`,
    comparison: `<div class="comparison-label">Original:</div>
<div class="comparison-old">\\begin{figure}
  \\includegraphics{image.png}
  % TODO: add label
  \\caption{Results}
\\end{figure}</div>
<div class="comparison-label" style="margin-top: 0.75rem;">Suggested:</div>
<div class="comparison-new">\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=\\textwidth]{figures/results.pdf}
  \\label{fig:results}
  \\caption{Experimental results.}
\\end{figure}</div>`,
  },
};

// ============================================
// INITIALIZE
// ============================================
function initDiffDemo() {
  renderContent();
  setupEventListeners();
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Content type buttons
  document.querySelectorAll('.content-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const contentType = btn.dataset.content;
      setContentType(contentType);
    });
  });

  // Diff style buttons
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.dataset.style;
      setDiffStyle(style);
    });
  });
}

// ============================================
// SET CONTENT TYPE
// ============================================
function setContentType(contentType) {
  currentContentType = contentType;

  // Update button states
  document.querySelectorAll('.content-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.content === contentType);
  });

  // Update display
  renderContent();
  updateOriginalLineDisplay();
}

// ============================================
// SET DIFF STYLE
// ============================================
function setDiffStyle(style) {
  currentDiffStyle = style;

  // Update button states
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === style);
  });

  // Hide all containers
  document.querySelectorAll('.diff-view-zone-container, .diff-inline-container, .diff-split-container, .diff-hybrid-container, .diff-gdocs-container, .diff-cursor-container, .diff-ghost-container, .diff-draft-container').forEach(el => {
    el.classList.add('hidden');
  });

  // Show selected container
  const targetContainer = document.querySelector(`.diff-${style}-container`);
  if (targetContainer) {
    targetContainer.classList.remove('hidden');
  }

  // Update info bar
  updateStyleInfo(style);

  // Render content for the style
  renderContent();
}

// ============================================
// UPDATE STYLE INFO BAR
// ============================================
function updateStyleInfo(style) {
  const info = diffStyles[style];
  const nameEl = document.querySelector('.diff-style-name');
  const descEl = document.querySelector('.diff-style-desc');

  if (nameEl) nameEl.textContent = info.name;
  if (descEl) descEl.textContent = info.description;
}

// ============================================
// UPDATE ORIGINAL LINE DISPLAY
// ============================================
function updateOriginalLineDisplay() {
  const content = currentContentType === 'paragraph' ? paragraphContent : latexContent;
  const originalTextContent = document.querySelector('.original-text-content');
  if (originalTextContent) {
    originalTextContent.innerHTML = `<span class="code-comment code-selected">${content.original.split('\n')[0]}...</span>`;
  }
}

// ============================================
// RENDER CONTENT BASED ON CURRENT STATE
// ============================================
function renderContent() {
  const content = currentContentType === 'paragraph' ? paragraphContent : latexContent;

  // Render for each style
  renderViewZone(content);
  renderInline(content);
  renderSplit(content);
  renderHybrid(content);
  renderGDocs(content);
  renderCursor(content);
  renderGhost(content);
  renderDraft(content);

  // Update change summary
  updateChangeSummary();
}

// Render VIEW ZONE style
function renderViewZone(content) {
  const container = document.getElementById('viewZoneContent');
  if (container) {
    container.innerHTML = content.viewZone.old + content.viewZone.new;
  }
}

// Render INLINE style
function renderInline(content) {
  const container = document.getElementById('inlineContent');
  if (container) {
    container.innerHTML = content.inline;
  }
}

// Render SPLIT style
function renderSplit(content) {
  const oldContainer = document.getElementById('splitOldContent');
  const newContainer = document.getElementById('splitNewContent');
  if (oldContainer) oldContainer.innerHTML = content.split.old;
  if (newContainer) newContainer.innerHTML = content.split.new;
}

// Render HYBRID style
function renderHybrid(content) {
  const container = document.getElementById('hybridContent');
  if (container) {
    container.innerHTML = content.hybrid;
  }
}

// Render GDOCS style
function renderGDocs(content) {
  const container = document.getElementById('gdocsContent');
  const commentText = document.getElementById('gdocsCommentText');
  if (container) container.innerHTML = content.gdocs;
  if (commentText) commentText.textContent = content.gdocsComment;
}

// Render CURSOR style
function renderCursor(content) {
  const container = document.getElementById('cursorContent');
  if (container) {
    container.innerHTML = content.cursor;
  }
}

// Render GHOST style
function renderGhost(content) {
  const container = document.getElementById('ghostContent');
  if (container) {
    container.innerHTML = content.ghost;
  }
}

// Render DRAFT style
function renderDraft(content) {
  const previewContainer = document.getElementById('draftPreviewContent');
  const comparisonContainer = document.getElementById('draftComparisonContent');
  if (previewContainer) {
    previewContainer.innerHTML = `<pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">${content.draft.preview}</pre>`;
  }
  if (comparisonContainer) {
    comparisonContainer.innerHTML = content.draft.comparison;
  }
}

// Update change summary line
function updateChangeSummary() {
  const counts = changeCounts[currentContentType];
  const summaryText = document.getElementById('changeSummaryText');
  if (summaryText && counts) {
    const total = counts.replacements + counts.deletions + counts.additions + counts.moved;
    const parts = [];
    if (counts.replacements > 0) parts.push(`${counts.replacements} replacement${counts.replacements > 1 ? 's' : ''}`);
    if (counts.deletions > 0) parts.push(`${counts.deletions} deletion${counts.deletions > 1 ? 's' : ''}`);
    if (counts.additions > 0) parts.push(`${counts.additions} addition${counts.additions > 1 ? 's' : ''}`);
    if (counts.moved > 0) parts.push(`${counts.moved} moved`);
    summaryText.textContent = `${total} changes: ${parts.join(', ')}`;
  }
}

// Toggle draft diff comparison
let draftExpanded = false;
function toggleDraftDiff() {
  draftExpanded = !draftExpanded;
  const comparison = document.getElementById('draftComparisonContent');
  const toggleBtn = document.querySelector('.diff-draft-toggle');
  const toggleText = document.getElementById('draftToggleText');

  if (comparison) {
    comparison.classList.toggle('hidden', !draftExpanded);
  }
  if (toggleBtn) {
    toggleBtn.classList.toggle('expanded', draftExpanded);
  }
  if (toggleText) {
    toggleText.textContent = draftExpanded ? 'Hide diff' : 'Show diff';
  }
}

// Regenerate (Try again) - simulated
function regenerateChange() {
  showToast('Regenerating suggestion...', 'info');
  // In real implementation, this would request a new AI suggestion
}

// ============================================
// ACTIONS
// ============================================
function acceptChange() {
  // Hide all diff containers
  document.querySelectorAll('.diff-view-zone-container, .diff-inline-container, .diff-split-container, .diff-hybrid-container, .diff-gdocs-container, .diff-cursor-container, .diff-ghost-container, .diff-draft-container').forEach(el => {
    el.classList.add('hidden');
  });
  // Hide change summary
  const summary = document.getElementById('changeSummary');
  if (summary) summary.classList.add('hidden');

  // Show undo toast
  showUndoToast();
}

function rejectChange() {
  showToast('Changes discarded', 'info');
  // Hide all diff containers
  document.querySelectorAll('.diff-view-zone-container, .diff-inline-container, .diff-split-container, .diff-hybrid-container, .diff-gdocs-container, .diff-cursor-container, .diff-ghost-container, .diff-draft-container').forEach(el => {
    el.classList.add('hidden');
  });
  // Hide change summary
  const summary = document.getElementById('changeSummary');
  if (summary) summary.classList.add('hidden');
}

// Show undo toast with Undo button
function showUndoToast() {
  const existing = document.querySelector('.undo-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'undo-toast';
  toast.innerHTML = `
    <span class="undo-toast-text">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Changes applied
    </span>
    <button class="undo-toast-btn" onclick="undoChange()">Undo</button>
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5000);
}

// Undo the accepted change
function undoChange() {
  const toast = document.querySelector('.undo-toast');
  if (toast) toast.remove();

  // Show change summary again
  const summary = document.getElementById('changeSummary');
  if (summary) summary.classList.remove('hidden');

  // Show the current diff style again
  setDiffStyle(currentDiffStyle);
  showToast('Change undone', 'info');
}

function acceptHunk(hunkIndex) {
  showToast(`Hunk ${hunkIndex + 1} accepted`, 'success');
}

function rejectHunk(hunkIndex) {
  showToast(`Hunk ${hunkIndex + 1} rejected`, 'info');
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
  const existing = document.querySelector('.demo-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `demo-toast demo-toast-${type}`;
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      ${type === 'success'
        ? '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />'
        : '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'}
    </svg>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? 'var(--accent-success)' : 'var(--bg-tertiary)'};
    color: ${type === 'success' ? 'white' : 'var(--text-primary)'};
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    box-shadow: 0 4px 16px var(--shadow-soft);
    z-index: 1000;
    animation: slideUp 0.2s ease;
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ============================================
// CSS ANIMATIONS
// ============================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(1rem); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }

  .flash-success {
    animation: flashGreen 0.5s ease;
  }

  @keyframes flashGreen {
    0%, 100% { background: transparent; }
    50% { background: rgba(34, 197, 94, 0.2); }
  }
`;
document.head.appendChild(styleSheet);

// ============================================
// INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', initDiffDemo);

// ============================================
// EXPORTS FOR HTML
// ============================================
window.setContentType = setContentType;
window.setDiffStyle = setDiffStyle;
window.acceptChange = acceptChange;
window.rejectChange = rejectChange;
window.acceptHunk = acceptHunk;
window.rejectHunk = rejectHunk;
window.toggleDraftDiff = toggleDraftDiff;
window.regenerateChange = regenerateChange;
window.undoChange = undoChange;
