import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, ChevronRight, Plus } from "lucide-react";

// ============================================
// GREETING LOGIC
// ============================================
function useGreeting(name: string) {
  return useMemo(() => {
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 17) greeting = "Good afternoon";
    return `${greeting}, ${name}`;
  }, [name]);
}

// ============================================
// TYPES
// ============================================
type ModuleType = "biblio" | "manu" | "discover";

interface RecentItem {
  id: string;
  title: string;
  module: ModuleType;
  time: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  mentions?: { text: string; module: ModuleType }[];
}

// ============================================
// MOCK DATA
// ============================================
const recentItems: RecentItem[] = [
  { id: "1", title: "NeurIPS_Draft_v3.tex", module: "manu", time: "10 min ago" },
  { id: "2", title: "Attention Is All You Need", module: "biblio", time: "2 hours ago" },
  { id: "3", title: "Thesis_Chapter_01", module: "manu", time: "Yesterday" },
  { id: "4", title: "Transformer Architectures", module: "biblio", time: "2 days ago" },
  { id: "5", title: "Visual RAG Methods", module: "biblio", time: "3 days ago" },
];

const tasks: Task[] = [
  { id: "1", text: "Finish reading", completed: false, mentions: [{ text: "@Attention_is_all", module: "biblio" }] },
  { id: "2", text: "Rewrite intro in", completed: false, mentions: [{ text: "@NeurIPS_Draft", module: "manu" }] },
  { id: "3", text: "Add citations to", completed: false, mentions: [{ text: "@Thesis_01", module: "manu" }] },
  { id: "4", text: "Review related work section", completed: false },
  { id: "5", text: "Export bib for", completed: true, mentions: [{ text: "@ICML_Sub", module: "manu" }] },
];

// ============================================
// SUB-COMPONENTS
// ============================================
function SearchBar() {
  return (
    <div className="mx-auto mb-8 max-w-lg">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm transition-colors focus-within:border-manu focus-within:shadow-md">
        <Search className="size-5 shrink-0 text-manu" />
        <Input
          type="text"
          placeholder="Search papers, manuscripts, tasks..."
          className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
        />
        <kbd className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

function RecentCard({ item }: { item: RecentItem }) {
  const dotColor = item.module === "biblio" ? "bg-biblio" : "bg-manu";

  return (
    <Card className="min-w-36 max-w-56 flex-1 cursor-pointer rounded-xl border-border p-3.5 transition-all hover:-translate-y-0.5 hover:border-manu hover:shadow-lg">
      <div className="mb-1 flex items-center gap-2.5">
        <div className={`size-2 shrink-0 rounded-full ${dotColor}`} />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {item.title}
        </span>
      </div>
      <div className="pl-5 text-xs text-muted-foreground">{item.time}</div>
    </Card>
  );
}

function RecentStrip() {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Recent
        </span>
        <button className="text-xs font-medium text-manu hover:underline">
          View all
        </button>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-1">
          {recentItems.map((item) => (
            <RecentCard key={item.id} item={item} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </section>
  );
}

// ============================================
// MODULE CARD ILLUSTRATIONS
// ============================================
function BiblioIllustration() {
  return (
    <svg className="h-[60px] w-[72px] shrink-0" viewBox="0 0 100 80" fill="none">
      {/* Stack hints (corner edges behind) */}
      <rect className="stroke-biblio-strong dark:stroke-biblio" x="24" y="4" width="48" height="64" rx="3" strokeWidth="1.5" opacity="0.25" />
      <rect className="stroke-biblio-strong dark:stroke-biblio" x="20" y="8" width="48" height="64" rx="3" strokeWidth="1.5" opacity="0.4" />
      {/* Main paper */}
      <rect className="fill-[var(--paper-fill)] stroke-biblio-strong dark:stroke-biblio" x="16" y="12" width="48" height="64" rx="3" strokeWidth="2" />
      <path className="stroke-biblio-strong opacity-35 dark:stroke-biblio" d="M26 28h28M26 38h24M26 48h20M26 58h26" strokeWidth="2.5" strokeLinecap="round" />
      {/* Checkmark badge */}
      <circle className="fill-biblio-strong opacity-15 dark:fill-biblio" cx="78" cy="40" r="14" />
      <path className="stroke-biblio-strong dark:stroke-biblio" d="M72 40l4 4 8-8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ManuIllustration() {
  return (
    <svg className="h-[60px] w-[72px] shrink-0" viewBox="0 0 100 80" fill="none">
      {/* Main paper */}
      <rect className="fill-[var(--paper-fill)] stroke-manu-strong dark:stroke-manu" x="16" y="12" width="48" height="64" rx="3" strokeWidth="2" />
      <path className="stroke-manu-strong opacity-35 dark:stroke-manu" d="M26 28h28M26 38h24M26 48h20" strokeWidth="2.5" strokeLinecap="round" />
      {/* CITE button */}
      <rect className="fill-manu-strong dark:fill-manu" x="26" y="56" width="22" height="10" rx="5" />
      <text x="30" y="64" fill="var(--text-on-accent)" fontSize="6" fontWeight="bold" fontFamily="Inter, sans-serif">CITE</text>
      {/* Pen */}
      <g transform="translate(68, 8) rotate(20)">
        <rect className="fill-[var(--paper-fill)] stroke-manu-strong dark:stroke-manu" x="0" y="0" width="6" height="36" rx="3" strokeWidth="1.5" />
        <path className="fill-manu-strong dark:fill-manu" d="M0 30 L3 40 L6 30" />
      </g>
    </svg>
  );
}

function DiscoverIllustration() {
  return (
    <svg className="h-[60px] w-[72px] shrink-0" viewBox="0 0 100 80" fill="none">
      {/* Main paper */}
      <rect className="fill-[var(--paper-fill)] stroke-discover-strong dark:stroke-discover" x="16" y="12" width="48" height="64" rx="3" strokeWidth="2" />
      <path className="stroke-discover-strong opacity-35 dark:stroke-discover" d="M26 28h28M26 38h24M26 48h20M26 58h26" strokeWidth="2.5" strokeLinecap="round" />
      {/* Magnifying glass */}
      <circle className="fill-discover-strong opacity-15 dark:fill-discover" cx="78" cy="40" r="14" />
      <circle className="fill-[var(--paper-fill)] stroke-discover-strong dark:stroke-discover" cx="78" cy="40" r="11" strokeWidth="2" />
      <path className="stroke-discover-strong dark:stroke-discover" d="M86 48l6 6" strokeWidth="2.5" strokeLinecap="round" />
      {/* Focus lines inside magnifier */}
      <path className="stroke-discover-strong opacity-50 dark:stroke-discover" d="M71 37h14M71 43h10" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ModuleCard({
  title,
  subtitle,
  module,
  illustration,
  onClick,
}: {
  title: string;
  subtitle: string;
  module: ModuleType;
  illustration: React.ReactNode;
  onClick?: () => void;
}) {
  const gradientStyle = {
    biblio: { background: "linear-gradient(135deg, var(--biblio-tint) 0%, var(--biblio-light) 100%)" },
    manu: { background: "linear-gradient(135deg, var(--manu-tint) 0%, var(--manu-light) 100%)" },
    discover: { background: "linear-gradient(135deg, var(--discover-tint) 0%, var(--discover-light) 100%)" },
  }[module];

  const titleColor = {
    biblio: "text-biblio-strong",
    manu: "text-manu-strong",
    discover: "text-discover-strong",
  }[module];

  return (
    <Card
      className="flex-1 cursor-pointer overflow-hidden rounded-2xl border-border p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
      onClick={onClick}
    >
      <div
        className="flex h-full items-center gap-5 px-6 py-5"
        style={gradientStyle}
      >
        <div className="min-w-0 flex-1">
          <h3 className={`m-0 text-lg font-bold ${titleColor}`}>{title}</h3>
          <p className="m-0 text-sm text-secondary-foreground">{subtitle}</p>
        </div>
        {illustration}
        <ChevronRight className="size-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
      </div>
    </Card>
  );
}

function Mention({ text, module }: { text: string; module: ModuleType }) {
  const colors = {
    biblio: "bg-biblio-tint text-biblio-strong",
    manu: "bg-manu-tint text-manu-strong",
    discover: "bg-discover-tint text-discover-strong",
  }[module];

  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${colors}`}>
      {text}
    </span>
  );
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted">
      <Checkbox
        checked={task.completed}
        className="mt-0.5 border-muted-foreground data-[state=checked]:border-biblio data-[state=checked]:bg-biblio"
      />
      <span className={`text-sm leading-normal ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
        {task.text}
        {task.mentions?.map((mention, i) => (
          <span key={i}>
            {" "}
            <Mention text={mention.text} module={mention.module} />
          </span>
        ))}
      </span>
    </div>
  );
}

function PlannerCard() {
  return (
    <Card className="flex h-full flex-col rounded-2xl border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4 pt-5">
        <div>
          <h3 className="m-0 text-sm font-semibold text-foreground">Research Planner</h3>
          <p className="m-0 text-xs text-muted-foreground">4 tasks remaining</p>
        </div>
      </div>

      {/* Task list */}
      <div className="flex flex-1 flex-col gap-0.5 px-5 pb-5">
        <div className="flex flex-1 flex-col gap-0.5">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>

        {/* Add task input */}
        <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-transparent bg-muted px-3 py-2.5 transition-all focus-within:border-planner focus-within:bg-card">
          <Plus className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Add task... use @ to link"
            className="flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
interface HomePageProps {
  onNavigate?: (screen: "home" | "bibliography" | "editor" | "projects") => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const greeting = useGreeting("Mahdi");

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      {/* Greeting Header */}
      <div className="mb-6 text-center">
        <h1 className="m-0 text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="m-0 text-sm text-secondary-foreground">Pick up where you left off</p>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Recent Strip */}
      <RecentStrip />

      {/* Bento Grid */}
      <div className="grid grid-cols-[3fr_2fr] items-stretch gap-6">
        {/* Module Stack */}
        <div className="flex flex-col gap-4">
          <ModuleCard
            title="Bibliography"
            subtitle="127 papers organized"
            module="biblio"
            illustration={<BiblioIllustration />}
            onClick={() => onNavigate?.("bibliography")}
          />
          <ModuleCard
            title="Manuscripts"
            subtitle="8 active projects"
            module="manu"
            illustration={<ManuIllustration />}
            onClick={() => onNavigate?.("projects")}
          />
          <ModuleCard
            title="Discover"
            subtitle="Explore new research"
            module="discover"
            illustration={<DiscoverIllustration />}
          />
        </div>

        {/* Planner */}
        <PlannerCard />
      </div>
    </div>
  );
}
