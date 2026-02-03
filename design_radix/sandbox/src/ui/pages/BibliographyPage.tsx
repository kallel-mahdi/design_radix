import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Plus,
  Upload,
  Download,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Tag,
  Copy,
  Bell,
  Pencil,
  Trash2,
  Library,
} from "lucide-react";
import { ReferenceDetailsPanel } from "../components/ReferenceDetailsPanel";
import { BatchActionBar } from "../components/BatchActionBar";
import { AppLayout, type NavigationItem } from "../components/shared/AppLayout";
import { FileTabs, type FileTab } from "../components/shared/FileTabs";

// ============================================
// TYPES
// ============================================
type TagVariant = "cyan" | "violet" | "emerald" | "amber";

interface ReferenceTag {
  label: string;
  variant: TagVariant;
}

interface Author {
  id: string;
  given: string;
  family: string;
}

interface Reference {
  id: string;
  type: string;
  title: string;
  authors: Author[];
  authorsDisplay: string;
  year: string;
  venue: string;
  tags: ReferenceTag[];
  hasFile: boolean;
  doi: string;
}

interface Collection {
  id: string;
  name: string;
  children?: Collection[];
}

// ============================================
// MOCK DATA
// ============================================
const collections: Collection[] = [
  {
    id: "1",
    name: "Offline RL",
    children: [
      { id: "1-1", name: "On-Policy Methods" },
      { id: "1-2", name: "Off-Policy Methods" },
      { id: "1-3", name: "Model-Based" },
    ],
  },
  { id: "2", name: "Exploration" },
  { id: "3", name: "To Read" },
];

const references: Reference[] = [
  {
    id: "1",
    type: "conference",
    title: "A Study of Plasticity Loss in On-Policy DeepRL",
    authors: [
      { id: "1-1", given: "Adam", family: "Julian" },
      { id: "1-2", given: "Jordan", family: "Ash" },
    ],
    authorsDisplay: "Julian, A., Ash, J.",
    year: "2024",
    venue: "ICML",
    tags: [
      { label: "plasticity", variant: "cyan" },
      { label: "deep-rl", variant: "violet" },
    ],
    hasFile: true,
    doi: "10.48550/arXiv.2405",
  },
  {
    id: "2",
    type: "conference",
    title: "Robust On-Policy Sampling for Policy Evaluation",
    authors: [
      { id: "2-1", given: "Hao", family: "Zhang" },
      { id: "2-2", given: "Wei", family: "Chen" },
    ],
    authorsDisplay: "Zhang, H., et al.",
    year: "2022",
    venue: "NeurIPS",
    tags: [
      { label: "policy-eval", variant: "emerald" },
      { label: "data-eff", variant: "amber" },
    ],
    hasFile: true,
    doi: "10.48550/arXiv.2111",
  },
  {
    id: "3",
    type: "article",
    title: "On-Policy Deep RL for Average-Reward Criterion",
    authors: [
      { id: "3-1", given: "Shangtong", family: "Zhang" },
      { id: "3-2", given: "Keith", family: "Ross" },
    ],
    authorsDisplay: "Zhang, S., Ross, K.",
    year: "2021",
    venue: "ICML",
    tags: [
      { label: "policy-eval", variant: "emerald" },
      { label: "deep-rl", variant: "violet" },
    ],
    hasFile: true,
    doi: "10.48550/arXiv.2106",
  },
];

// File tabs for Bibliography module
const biblioFileTabs: FileTab[] = [
  { id: "main", name: "Main.tex", icon: FileText },
  { id: "reference", name: "reference.bib", icon: FileText },
];

// ============================================
// SUB-COMPONENTS
// ============================================

function CollectionSidebar() {
  const [activeCollection, setActiveCollection] = useState("1");
  const [myLibraryOpen, setMyLibraryOpen] = useState(true);
  const collectionButtonBase =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover-subtle)] hover:text-[color:var(--text-primary)]";
  const collectionButtonActive =
    "bg-[color:var(--selection)] text-[color:var(--biblio)] font-medium";

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar">
      {/* Header - aligned with activity bar header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Library
        </span>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon-xs">
            <Plus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-xs">
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-xs">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto p-2">
        {/* My Library as parent folder */}
        <Collapsible open={myLibraryOpen} onOpenChange={setMyLibraryOpen}>
          <CollapsibleTrigger asChild>
            <button className={`${collectionButtonBase} font-medium text-[color:var(--text-primary)]`}>
              {myLibraryOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <Library className="size-4" />
              <span>My Library</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <nav className="ml-3 flex flex-col gap-0.5 border-l pl-2">
              {collections.map((collection) =>
                collection.children ? (
                  <Collapsible key={collection.id} defaultOpen className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <button
                        className={`${collectionButtonBase} ${
                          activeCollection === collection.id ? collectionButtonActive : ""
                        }`}
                        onClick={() => setActiveCollection(collection.id)}
                      >
                        <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        <Folder className="size-4" />
                        <span>{collection.name}</span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 flex flex-col gap-0.5 border-l pl-2">
                        {collection.children.map((child) => (
                          <button
                            key={child.id}
                            className={`${collectionButtonBase} ${
                              activeCollection === child.id ? collectionButtonActive : ""
                            }`}
                            onClick={() => setActiveCollection(child.id)}
                          >
                            <Folder className="size-4" />
                            <span>{child.name}</span>
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <button
                    key={collection.id}
                    className={`${collectionButtonBase} ${
                      activeCollection === collection.id ? collectionButtonActive : ""
                    }`}
                    onClick={() => setActiveCollection(collection.id)}
                  >
                    <Folder className="size-4" />
                    <span>{collection.name}</span>
                  </button>
                )
              )}
              <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[color:var(--biblio)] hover:bg-[color:var(--bg-hover-subtle)]">
                <Plus className="size-4" />
                <span>Add New Collection</span>
              </button>
            </nav>
          </CollapsibleContent>
        </Collapsible>

        {/* Spacer to push Group Libraries to middle */}
        <div className="flex-1" />

        {/* Group Libraries Section - vertically centered */}
        <div className="flex items-center justify-between border-t px-2 py-2">
          <span className="text-xs font-medium text-muted-foreground">Group Libraries</span>
          <Badge variant="secondary" className="text-xs">45</Badge>
        </div>
      </div>
    </aside>
  );
}


function Toolbar() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-4 pt-3">
      <div className="flex items-center gap-1">
        <Button size="sm">
          <Plus className="size-4" />
          Add
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="size-4" />
          Import
        </Button>
        <Button variant="outline" size="sm">
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search references..."
          className="h-8 w-48 pl-8 text-sm"
        />
      </div>
    </div>
  );
}

function TagBadge({ tag }: { tag: ReferenceTag }) {
  const variantClasses: Record<TagVariant, string> = {
    cyan: "bg-tag-cyan-bg text-tag-cyan-text",
    violet: "bg-tag-violet-bg text-tag-violet-text",
    emerald: "bg-tag-emerald-bg text-tag-emerald-text",
    amber: "bg-tag-amber-bg text-tag-amber-text",
  };

  return (
    <Badge variant="secondary" className={`text-xs font-normal ${variantClasses[tag.variant]}`}>
      {tag.label}
    </Badge>
  );
}

function ReferenceTable({
  selectedReference,
  onSelectReference,
  onDoubleClick,
  selectedRows,
  onToggleRow,
  onToggleAll,
}: {
  selectedReference: Reference | null;
  onSelectReference: (ref: Reference | null) => void;
  onDoubleClick?: (ref: Reference) => void;
  selectedRows: Record<string, boolean>;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}) {
  const allChecked = references.length > 0 && references.every((r) => selectedRows[r.id]);
  const someChecked = references.some((r) => selectedRows[r.id]) && !allChecked;

  const handleRowClick = (ref: Reference) => {
    onSelectReference(ref);
  };

  return (
    <div className="flex-1 overflow-auto px-4 py-3">
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--bg-tertiary)]">
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={(checked) => onToggleAll(checked === true)}
                />
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Title
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Authors
              </TableHead>
              <TableHead className="w-16 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Year
              </TableHead>
              <TableHead className="w-20 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Venue
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tags
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {references.map((ref) => {
              const isChecked = selectedRows[ref.id];
              const isActive = selectedReference?.id === ref.id;
              return (
                <TableRow
                  key={ref.id}
                  data-state={isActive ? "selected" : undefined}
                  className="cursor-pointer hover:bg-[color:var(--bg-hover-subtle)] data-[state=selected]:bg-[color:var(--selection)]"
                  onClick={() => handleRowClick(ref)}
                  onDoubleClick={() => onDoubleClick?.(ref)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => onToggleRow(ref.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="font-normal">{ref.title}</TableCell>
                  <TableCell className="text-muted-foreground">{ref.authorsDisplay}</TableCell>
                  <TableCell className="text-muted-foreground">{ref.year}</TableCell>
                  <TableCell className="text-muted-foreground">{ref.venue}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {ref.tags.map((tag, i) => (
                        <TagBadge key={i} tag={tag} />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
interface BibliographyPageProps {
  onNavigateHome?: () => void;
  onOpenPdf?: () => void;
}

export function BibliographyPage({ onNavigateHome, onOpenPdf }: BibliographyPageProps) {
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [activeActivity, setActiveActivity] = useState("library");
  const [activeTab, setActiveTab] = useState("main");

  // Build navigation items with per-item callbacks
  const navItems: NavigationItem[] = [
    { id: "library", icon: BookOpen, label: "Library", selected: activeActivity === "library", onClick: () => setActiveActivity("library") },
    { id: "search", icon: Search, label: "Search", selected: activeActivity === "search", onClick: () => setActiveActivity("search") },
    { id: "tags", icon: Tag, label: "Tags", selected: activeActivity === "tags", onClick: () => setActiveActivity("tags") },
    { id: "duplicates", icon: Copy, label: "Duplicates", selected: activeActivity === "duplicates", onClick: () => setActiveActivity("duplicates") },
    { id: "notifications", icon: Bell, label: "Notifications", selected: activeActivity === "notifications", onClick: () => setActiveActivity("notifications") },
  ];

  const handleSelectReference = (ref: Reference | null) => {
    // Toggle: if clicking the same reference, deselect it
    if (selectedReference?.id === ref?.id) {
      setSelectedReference(null);
    } else {
      setSelectedReference(ref);
    }
  };

  const handleClosePanel = () => {
    setSelectedReference(null);
  };

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelectedRows((prev) => ({ ...prev, [id]: checked }));
  };

  const handleToggleAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {};
    if (checked) {
      references.forEach((ref) => {
        newSelected[ref.id] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedRows({});
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  return (
    <AppLayout
      activityBarItems={navItems}
      onLogoClick={onNavigateHome ?? (() => {})}
      sidebar={{ content: <CollectionSidebar />, visible: true }}
      dataModule="bibliography"
    >
      {/* Main Content Area - uses CSS Grid to push table when panel opens */}
      <div className="flex-1 grid grid-cols-12 min-h-0">
        {/* Table Area - shrinks when panel is open */}
        <main
          className="relative flex flex-col min-h-0 overflow-hidden"
          style={{ gridColumn: selectedReference ? "1 / 10" : "1 / 13" }}
        >
          {/* File Tabs (shared component) */}
          <FileTabs
            tabs={biblioFileTabs}
            activeId={activeTab}
            onSelect={setActiveTab}
            className="bg-card"
          />
          <Toolbar />
          <ReferenceTable
            selectedReference={selectedReference}
            onSelectReference={handleSelectReference}
            onDoubleClick={onOpenPdf ? () => onOpenPdf() : undefined}
            selectedRows={selectedRows}
            onToggleRow={handleToggleRow}
            onToggleAll={handleToggleAll}
          />

          {/* Batch Action Bar - centered relative to table area */}
          <BatchActionBar
            selectedCount={selectedCount}
            onClearSelection={handleClearSelection}
            onAddTag={(tag) => console.log("Add tag:", tag)}
            onMoveTo={(collection) => console.log("Move to:", collection)}
            onDelete={() => console.log("Delete selected")}
          />
        </main>

        {/* Details Panel - inline, ~25% width (3 of 12 columns) */}
        {selectedReference && (
          <div className="min-h-0 overflow-hidden" style={{ gridColumn: "10 / 13" }}>
            <ReferenceDetailsPanel
              reference={selectedReference}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
