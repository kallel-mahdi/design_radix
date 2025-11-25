# Figma Design Specifications

**Source**: Citable 1.3 Figma Project (File Key: `FQAAByuxVQOmTEERCXkiAC`)
**Screenshots**: `/docs/screenshots_figma/`
**Last Updated**: 2025-11-25

---

## Frame Reference

| Frame | Screen | Screenshot |
|-------|--------|------------|
| 33 | LIBRARY (main view) | `004036.png` |
| 29 | Details Panel - Info tab | `004058.png` |
| 30 | Details Panel - PDF tab | `004117.png` |
| 31 | Details Panel - Notes (empty) | `004144.png` |
| 32 | Details Panel - Notes (with content) | `004205.png` |
| 19 | FILTERS panel | `004237.png` |
| 35 | PROJECTS panel | `004303.png` |
| 36 | DUPLICATES panel | `004318.png` |
| 34 | SHARING (empty state) | `004347.png` |
| 37 | SHARING (with collaborators) | `004409.png` |
| 38 | Settings menu | `004450.png` |
| 39 | General Settings modal | `004521.png` |
| 40 | Project Default modal | `004545.png` |

---

## Frame 33: LIBRARY (Main View)

### Layout Structure
```
+----------+---------------+--------------------+-------------+
| Activity |  Sidebar      |   Main Content     |  Details    |
| Bar      |  (Collections)|   (Reference Table)|  Panel      |
| (icons)  |               |                    |  (collapsible)
+----------+---------------+--------------------+-------------+
```

### Activity Bar (Left Edge)
- 6 icons vertically stacked
- Icons: Library (active), Search, Tags, Duplicates (with badge), Sharing, Trash
- Settings gear icon at bottom
- Active state: filled icon with highlight background

### Sidebar - COLLECTION Section
- Header: "COLLECTION"
- Tree structure with expand/collapse arrows
- Reference counts displayed next to each collection:
  - My Library (45)
  - On-Policy Methods (12)
  - Offline RL (8)
  - Exploration (15)
  - To Read (10) - highlighted in green

### Toolbar
- "+ Add" button (green, primary)
- "Import" button (outline)
- "Export" button (outline)

### Reference Table Columns
| Column | Width | Content |
|--------|-------|---------|
| Checkbox | 32px | Selection checkbox |
| Title | flex | Reference title (clickable) |
| Authors | 120px | "Juliani, A., Ash, J." format |
| Year | 60px | "2024" |
| Venue | 80px | "ICML", "NeurIPS" |
| Tags | 150px | Green filled pills |
| Files | 40px | Paperclip icon if PDF attached |
| DOI | 180px | "10.48550/arXiv:2405.19104" |

### Tag Badges
- Green filled background (#10B981)
- White text
- Rounded pills
- Examples: "plasticity", "deep-rl", "on-policy", "policy-evaluation", "data-efficiency"

### Empty State (Details Panel)
- Star/sparkle icon
- Text: "Select a reference to view details"

---

## Frames 29-32: Details Panel

### Header
- "Details" title
- Close button (X) top-right

### Tab Navigation
- Three tabs: Info | PDF | Notes
- Active tab: green underline

### Info Tab (Frame 29)
Fields displayed (read-only):
- Title (text input style)
- Authors (text input)
- Year + Venue (side by side)
- DOI / URL (text input)

### PDF Tab (Frame 30)
- Icon: PDF document icon
- Header: "PDF VIEWER"
- Subtext: "Click to open PDF in viewer"
- Preview area: Gray placeholder with "PDF Preview"

### Notes Tab - Empty (Frame 31)
- Icon: Notebook icon
- Header: "NOTES"
- Subtext: "No notes have been added"

### Notes Tab - With Content (Frame 32)
- Note card with:
  - Content: "Key finding: plasticity loss correlates with performance degradation"
  - Timestamp: "15/03/2024"

---

## Frame 19: FILTERS Panel

### Layout
- Replaces sidebar when FILTERS view active
- Search bar at top: "Search references..."

### AUTHOR Section
- Checkbox list of authors:
  - Juliani, A.
  - Ash, J.
  - Zhong, H.
  - Zhang, S.
  - Ross, K.
  - Mao, H.
  - Lee, B.
  - Allen, J.

### YEAR RANGE Section
- Dual-handle slider
- Range: 2000 - 2024
- Current selection visualized with green track

### VENUE Section
- Checkbox list:
  - ICML
  - NeurIPS
  - ICLR
  - CoRL
  - arXiv

### TAGS Section
- Checkbox list:
  - deep-rl
  - on-policy
  - offline-rl
  - exploration
  - theory

### Footer
- "Manage Filters" button (green, primary)

---

## Frame 35: PROJECTS Panel

### Sidebar
- Header: "PROJECTS"
- Project list (expandable):
  - Thesis - Chapter 3 (highlighted green)
  - Survey Paper
  - ICML 2025 Submission

### LINKED COLLECTIONS Section
- Header: "LINKED COLLECTIONS"
- Toggle switches for each collection:
  - On-Policy Methods (ON)
  - Offline RL (ON)
  - Exploration (OFF)

### Main Area
- Reference table filtered by linked collections
- Same columns as LIBRARY view

---

## Frame 36: DUPLICATES Panel

### Sidebar
- Header: "DUPLICATES"
- Sections:
  - Duplicate groups (highlighted)
  - Rules (read-only)
  - Decision history

### Main Area - Duplicate Cards

Each duplicate group shows:

**WARNING Card**:
```
WARNING (icon)

[Existing Reference]
Title: A Study of Plasticity Loss in On-Policy Deep Reinforcement Learning
Existing
Juliani, A., Ash, J. - 2024
DOI: 10.48550/arXiv:2405.19104
Tag: deep-rl

[Duplicate Reference]
Title: Plasticity Loss in On-Policy DRL (Duplicate)
Juliani, A., Ash, J. - 2024
DOI: 10.48550/arXiv:2405.19104

[Actions]
[Keep Existing] (green button)  [Merge Fields] (gray button)
```

---

## Frames 34/37: SHARING Panel

### Sidebar
- Header: "SHARING"
- Sections:
  - Owned (highlighted)
  - Shared with me

### Invite Section
- Header: "Invite collaborator"
- Email input field: "Email address"
- Role dropdown: "Viewer" (default)
- "Invite" button (green)

### Empty State (Frame 34)
- Icon: Two people icon
- Header: "START COLLABORATING"
- Subtext: "You haven't invited anyone yet"

### Collaborator Table (Frame 37)
| Column | Content |
|--------|---------|
| Title | Name + email |
| Role | Dropdown (Viewer/Editor) |
| Status | - |
| Action | - |

Example rows:
- Alice Chen (alice@example.com) - Viewer
- Bob Smith (bob@example.com) - Viewer
- Carol White (carol@example.com) - Viewer

---

## Frames 38-40: Settings

### Settings Menu (Frame 38)
Accessed via gear icon in Activity Bar:
- General (highlighted)
- Project Defaults
- Shortcuts
- Storage/Sync

### General Settings Modal (Frame 39)
**Title**: "General Settings"

Settings with toggles:
| Setting | Default |
|---------|---------|
| Collapse Details pane by default | ON |
| Auto-detect duplicates | ON |
| Show citation preview | OFF |

**Footer**: Cancel | Save settings (green)

### Project Default Modal (Frame 40)
**Title**: "Project Default"

Fields:
- Bibliography Style(.bst): Dropdown, default "Unsrtnat"
- Default Cite Command: Dropdown, default "\citep"
- "Insert natbib preamble" button (green outline)
  - Helper text: "Adds \usepackage{natbib} to your document"

**Footer**: Cancel | Save settings (green)

---

## Design Tokens (Observed)

### Colors
- Primary Green: #10B981 (buttons, active states, tags)
- Background Dark: #1F2937
- Surface Dark: #374151
- Border: #4B5563
- Text Primary: #F9FAFB
- Text Secondary: #9CA3AF

### Typography
- Headers: Inter/System, 14-16px, semibold
- Body: Inter/System, 13-14px, regular
- Small: Inter/System, 12px, regular

### Spacing
- Activity Bar width: 48px
- Sidebar width: 240px (resizable)
- Details Panel width: ~320px (collapsible)
- Table row height: 48px
- Icon size: 20-24px

### Components
- Buttons: Rounded corners (6px), padding 8px 16px
- Inputs: Dark background, subtle border, 40px height
- Cards: Subtle border, 8px padding
- Toggles: Green track when ON, gray when OFF
- Checkboxes: Green fill when checked
- Dropdowns: Dark background, chevron icon

---

## Implementation Notes

### What Matches Figma
- Activity Bar icons and layout
- Reference table structure
- Dark theme color palette
- Button styling (CVA variants)
- Basic Details Panel structure

### What Differs from Figma
- Collection tree: Currently flat, Figma shows nested with counts
- Tag badges: Different styling (not green filled)
- Details Panel: Partially implemented
- Filters Panel: Not implemented
- Duplicates UI: Only badge, no merge cards
- Settings modals: Not implemented
- Sharing: Not implemented (Phase 2)

### Mapping to Sessions
| Figma Feature | Session |
|---------------|---------|
| Collection counts/nesting | Phase 1 |
| Filters Panel (Frame 19) | Session 13 |
| Projects Panel (Frame 35) | Session 14-15 |
| Duplicates UI (Frame 36) | Session 17-18 |
| Settings (Frames 38-40) | Phase 3 |
| Sharing (Frames 34/37) | Phase 2 |
