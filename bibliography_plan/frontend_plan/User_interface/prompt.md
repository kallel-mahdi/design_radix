a
a
a
a
a
a
a
Got it! Here’s a ready-to-paste **Make / Figma AI prompt** for your VS-Code-style bibliography manager, followed by a quick explanation of what lives on the activity bar for us.

# Prompt for Figma “Make” / Design-AI

Design a **desktop web app** called **Citable – Bibliography Manager** that follows a **VS-Code aesthetic**: dark UI, neon-green accents, slim line icons, and a 3-panel layout. Create **6 frames (1440×900)** showing key states.

## Global visual system

* **Theme:** very dark gray background, subtle elevated surfaces.

  * Background: `#0F1115`; Surfaces: `#171A21`; Borders: `#1F2330`;
  * Accent (neon green): `#04E39E`; Accent hover: `#2AF4B4`;
  * Text: `#E6E8EC`; Muted: `#9CA3AF`; Danger: `#EF4444`; Warning: `#F59E0B`.
* **Typography:** Inter (or SF) – 12/14/16/20/24 sizes; semi-bold for headings.
* **Iconography:** line icons, 1.5px stroke, rounded corners (8–12px).
* **Spacing grid:** 8px; panel gutters 16px; rounded corners 12px on cards/panels.
* **Focus/active states:** neon-green outline glow; same as your editor.

## App structure (all frames use this skeleton)

* **Activity Bar (far left, 64px):** vertical icon bar with badges and tooltips.
* **Context Sidebar (left column, 280px):** contents change by activity.
* **Main Pane (center, fluid):** table view of items, multi-select, bulk actions.
* **Details/Preview Pane (right, 360px, collapsible):** Info • PDF • Notes tabs.
* **Top Toolbar (above Main Pane):** `Add` (primary) + `Import` + `Export`; bulk actions appear when rows selected.
* **Status Bar (bottom):** “N selected • Sync OK • Duplicates 3 • Offline queue 2”.

## Activity Bar (V1 items, top→bottom)

1. **Library** (folder icon) – default.
2. **Search** (magnifier).
3. **Linked Projects** (chain link).
4. **Duplicates** (warning triangle with count badge).
5. **Sharing** (users).
6. **Settings** (gear).
   *(Parking-lot for v1.5: **Capture Queue** ⏳ and **Notifications** 🔔—include icons grayed-out but disabled.)*

## Context by activity

* **Library (Explorer analogue) – Frame 1**

  * Sidebar:

    * “My Library” (tree of **Collections**; nested; counts); “Group Libraries”; **Tags** list; **Trash**.
    * Each collection row: name, count, hover actions (… menu).
  * Main Pane: **Table** with columns: Title • Authors • Year • Venue • Tags • Cited ✓ • Attachments • DOI.

    * Sample rows (use realistic RL papers): *A Study of Plasticity Loss… (Juliani & Ash, 2024)*, *On-Policy DRL for Average-Reward… (Zhang & Ross, 2021)*, etc.
    * Row hover quick actions: Open PDF, Edit, Move, Tag.
  * Right Pane (Details):

    * **Info tab:** editable fields (title, authors, year, venue, DOI/URL, pages, publisher).
    * **PDF tab:** built-in viewer with last-page memory; toolbar (highlight, note).
    * **Notes tab:** list, add, edit, delete notes.

* **Search – Frame 2**

  * Sidebar: faceted filters (Author, Year range slider, Venue, Tag, Type).
  * Main Pane: search results table; search bar in header with “filter active” chips and Clear button.

* **Linked Projects – Frame 3**

  * Sidebar: list of LaTeX **projects**; each shows toggles for **linked collections**.
  * Main Pane: items scoped to the selected project with top toggles **All | Cited ✓ | Uncited**.
  * Right Pane: same Details; show a small “Cited in this project ✓” badge near title.

* **Duplicates – Frame 4**

  * Sidebar: “Duplicate groups,” “Rules (read-only)”, “Decision history”.
  * Main Pane: **stacked cards per group** showing two (or more) suspected dupes with badges: “DOI match” or “Title+Year match”.

    * Actions on card: **Keep Existing**, **Merge Fields**, **Attach new PDF**, **Dismiss**.
  * Include Empty state (“No duplicates—nice!”) and error state.

* **Sharing – Frame 5**

  * Sidebar: **Owned** vs **Shared with me**.
  * Main Pane: table of collaborators for selected library/collection.

    * Top **Invite** row: Email field + Role dropdown (**Owner / Editor / Commenter / Viewer**) + Invite button.
    * Each collaborator row: name/email, role pill (dropdown to change), status (Pending/Active), actions (Remove).
  * Right Pane: audit line (“Added by X on DATE”).

* **Settings – Frame 6**

  * Sidebar: General • Project Defaults • Shortcuts • Storage/Sync.
  * Main:

    * **Project Defaults:** `.bst` selector (**plainnat**, **abbrvnat**, **unsrtnat**), default cite command (**\citep{}** or **\citet{}**), “Insert natbib preamble” quick action.
    * **Shortcuts:** overlay preview (Add=A, Cite=Cmd/Ctrl+K, Search=/, Rebuild=Cmd/Ctrl+R, Multi-select tips).
    * Toggle to collapse right Details pane by default.

## Key interactions to design

* **Add button + Dropzone:** primary green button; dropping files onto a **collection** files them there; show mini-toast summary (added / merged / errors).
* **Bulk selection:** click, Shift-range, Cmd/Ctrl toggle; sticky bulk toolbar (Move • Tag • Merge • Delete).
* **Cite awareness:** show a ✓ chip in table for items cited in the **current project**; **Uncited** filter toggle in Linked Projects.
* **De-dup before save (extension parity):** badge on Duplicates icon with count; clicking opens Frame 4.
* **Peek PDF:** Space opens a quick overlay preview without leaving the table.
* **Context menus:** right-click on rows and collections (Share, Export .bib, Move, Delete).
* **Status feedback:** offline banner; sync spinner; error toasts with “View details”.

## Content & copy (seed the mock)

* Empty states with helpful copy, e.g.,

  * Library empty: “Drop PDFs or click **Add** to start your library.”
  * Search empty: “No matches. Try removing filters.”
  * Duplicates empty: “No duplicates—nice!”
* Use realistic sample metadata (titles, authors, years, venues) for 8–10 RL papers.

## Deliverables

* 6 frames as listed; consistent components; auto-layout; color styles & text styles defined.
* Reusable components: Activity icon, Collection row, Table row, Tag chip, Role pill, Duplicate group card, PDF toolbar, Invite row, Buttons (primary/ghost), Toast.

---

# What’s on our Activity Bar (and why)

1. **Library (📁)** – Home base. Shows your **collection tree**, Tags, Trash. Where users spend most time importing, organizing, and reading.
2. **Search (🔎)** – Power filtering across the whole library (author/year/venue/tag). Keeps heavy filters out of the Library tree.
3. **Linked Projects (🔗)** – Our differentiator. Manage which **collections feed a LaTeX project**, and quickly see **Cited vs Uncited** items for that project.
4. **Duplicates (⚠️)** – A “problems panel” for reference hygiene. Resolve DOI or Title+Year collisions with **Keep / Merge / Attach PDF** actions.
5. **Sharing (👥)** – Manage collaborators and roles (Owner / Editor / Commenter / Viewer) on a library or collection. Mirrors your existing invite UI.
6. **Settings (⚙️)** – Project defaults (`.bst`, default cite command), shortcuts overlay, and basic storage/sync.

*(Optional for v1.5 once you wire the browser extension + notifications)*
7) **Capture Queue (⏳)** – Items the extension saved offline or queued; fix destinations and tags.
8) **Notifications (🔔)** – Invites, role changes, sync errors, and de-dup results in one place.

---

If you want, I can tailor the prompt for a specific canvas size system, or generate a second prompt focused just on the **Linked Projects** activity with the Uncited workflow.  I gave you as context two screenshots of our editor (it has green) and a competitors bibliography maanger (no green)
I'll create a VS Code-style bibliography manager called "Citable" with a dark UI, neon-green accents, and the multi-panel layout you've described. I'll build all 6 frames as different views within a single interactive application.



Let me start by creating the component structure with the activity bar navigation, context sidebar, main pane, and details pane for all the different views you've outlined.

I've created a comprehensive VS Code-style bibliography manager called "Citable" with all 6 views you requested. The app features a dark UI with neon-green accents (#04E39E) and follows a multi-panel layout similar to VS Code.



Key features implemented:



Activity Bar (64px) with 6 activities: Library, Search, Linked Projects, Duplicates (with badge), Sharing, and Settings
Library view: Collection tree with nested folders, tags list, and reference table with realistic RL papers
Search view: Faceted filters (author, year range slider, venue, tag) with active filter chips
Linked Projects view: Project selector with linked collections toggle and Cited/Uncited filter buttons
Duplicates view: Duplicate group cards showing DOI/Title+Year matches with Keep/Merge/Dismiss actions
Sharing view: Collaborator table with role management (Owner/Editor/Commenter/Viewer) and invite functionality
Settings view: Project defaults (.bst selector, cite command), keyboard shortcuts overlay, and general settings
Details pane (360px, collapsible): Info/PDF/Notes tabs for selected references
Status bar: Shows selection count, sync status, duplicate count, and offline queue


The app uses realistic sample data from reinforcement learning papers and includes empty states, bulk actions, multi-select support, and proper keyboard shortcut displays.

