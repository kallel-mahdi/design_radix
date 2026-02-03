import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppLayout, type NavigationItem } from "../components/shared/AppLayout"
import {
  Search,
  Plus,
  FolderOpen,
  FileText,
  MoreVertical,
  Download,
  Archive,
  ArchiveRestore,
  Trash2,
  Upload,
  Pencil,
} from "lucide-react"

// ============================================
// TYPES
// ============================================
interface Project {
  id: string
  title: string
  created_at: string
  updated_at: string
  is_archived: boolean
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "My Research Paper",
    created_at: "2024-12-15T10:30:00Z",
    updated_at: "2025-01-28T14:22:00Z",
    is_archived: false,
  },
  {
    id: "2",
    title: "Literature Review - Deep Learning",
    created_at: "2024-11-20T08:00:00Z",
    updated_at: "2025-01-27T09:45:00Z",
    is_archived: false,
  },
  {
    id: "3",
    title: "Conference Submission Draft",
    created_at: "2024-10-05T16:20:00Z",
    updated_at: "2025-01-25T11:30:00Z",
    is_archived: false,
  },
  {
    id: "4",
    title: "Thesis Chapter 2",
    created_at: "2024-09-01T09:00:00Z",
    updated_at: "2025-01-20T17:00:00Z",
    is_archived: false,
  },
  {
    id: "5",
    title: "Old Project (Archived)",
    created_at: "2024-06-10T12:00:00Z",
    updated_at: "2024-08-15T10:00:00Z",
    is_archived: true,
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Today"
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ProjectActionsMenu({
  project,
  onRename,
  onDownload,
  onArchive,
  onDelete,
}: {
  project: Project
  onRename: () => void
  onDownload: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Project actions">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onRename}>
          <Pencil />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDownload}>
          <Download />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onArchive}>
          {project.is_archived ? <ArchiveRestore /> : <Archive />}
          {project.is_archived ? "Restore" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProjectTable({
  projects,
  onOpenProject,
  onRename,
  onDownload,
  onArchive,
  onDelete,
}: {
  projects: Project[]
  onOpenProject: (project: Project) => void
  onRename: (project: Project) => void
  onDownload: (project: Project) => void
  onArchive: (project: Project) => void
  onDelete: (project: Project) => void
}) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Title
            </TableHead>
            <TableHead className="w-32 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Last Modified
            </TableHead>
            <TableHead className="w-32 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Created
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onOpenProject(project)}
            >
              <TableCell className="font-medium">{project.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(project.updated_at)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(project.created_at)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <ProjectActionsMenu
                  project={project}
                  onRename={() => onRename(project)}
                  onDownload={() => onDownload(project)}
                  onArchive={() => onArchive(project)}
                  onDelete={() => onDelete(project)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ProjectCard({
  project,
  onOpenProject,
  onRename,
  onDownload,
  onArchive,
  onDelete,
}: {
  project: Project
  onOpenProject: (project: Project) => void
  onRename: (project: Project) => void
  onDownload: (project: Project) => void
  onArchive: (project: Project) => void
  onDelete: (project: Project) => void
}) {
  return (
    <Card
      className="cursor-pointer py-0 transition-colors hover:border-primary/50"
      onClick={() => onOpenProject(project)}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{project.title}</h3>
          <p className="text-sm text-muted-foreground">
            Modified {formatDate(project.updated_at)}
          </p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectActionsMenu
            project={project}
            onRename={() => onRename(project)}
            onDownload={() => onDownload(project)}
            onArchive={() => onArchive(project)}
            onDelete={() => onDelete(project)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ isArchived }: { isArchived: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FolderOpen className="mb-4 size-12 text-muted-foreground/50" />
      <p className="text-sm text-foreground">
        {isArchived ? "No archived projects" : "No projects found"}
      </p>
      <p className="text-xs text-muted-foreground">
        {isArchived
          ? "Archived projects will appear here"
          : "Create your first project to get started"}
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim())
      setName("")
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleCreate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a new project or import from a ZIP file
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="My Research Paper"
              autoFocus
            />
          </div>
          <div
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              // In a real app, handle the dropped file here
              console.log("File dropped:", e.dataTransfer.files)
            }}
          >
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop a ZIP file, or{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
              >
                browse
              </button>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RenameProjectDialog({
  project,
  open,
  onOpenChange,
  onRename,
}: {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRename: (id: string, newName: string) => void
}) {
  const [name, setName] = useState(project?.title || "")

  // Update name when project changes
  if (project && name !== project.title && !open) {
    setName(project.title)
  }

  const handleRename = () => {
    if (project && name.trim()) {
      onRename(project.id, name.trim())
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleRename()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>Enter a new name for this project</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rename-project">Project Name</Label>
            <Input
              id="rename-project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!name.trim()}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmDialog({
  project,
  open,
  onOpenChange,
  onConfirm,
}: {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{project?.title}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
interface ProjectsPageProps {
  onNavigateHome?: () => void
  onOpenProject?: (project: Project) => void
}

export function ProjectsPage({ onNavigateHome, onOpenProject }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [activeTab, setActiveTab] = useState<"all" | "archived">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeActivity, setActiveActivity] = useState("projects")
  const [isLoading] = useState(false)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameProject, setRenameProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  // Build navigation items with per-item callbacks
  const navItems: NavigationItem[] = [
    { id: "projects", icon: FolderOpen, label: "Projects", selected: activeActivity === "projects", onClick: () => setActiveActivity("projects") },
    { id: "templates", icon: FileText, label: "Templates", selected: activeActivity === "templates", onClick: () => setActiveActivity("templates") },
  ]

  // Filter projects based on tab and search
  const filteredProjects = projects.filter((project) => {
    const matchesTab =
      activeTab === "all" ? !project.is_archived : project.is_archived
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Handlers
  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: String(Date.now()),
      title: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_archived: false,
    }
    setProjects((prev) => [newProject, ...prev])
  }

  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, title: newName, updated_at: new Date().toISOString() }
          : p
      )
    )
  }

  const handleArchiveProject = (project: Project) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id
          ? {
              ...p,
              is_archived: !p.is_archived,
              updated_at: new Date().toISOString(),
            }
          : p
      )
    )
  }

  const handleDeleteProject = () => {
    if (deleteProject) {
      setProjects((prev) => prev.filter((p) => p.id !== deleteProject.id))
      setDeleteProject(null)
    }
  }

  const handleDownloadProject = (project: Project) => {
    // In a real app, this would trigger a download
    console.log("Download project:", project.title)
  }

  const handleOpenProject = (project: Project) => {
    onOpenProject?.(project)
  }

  return (
    <AppLayout
      activityBarItems={navItems}
      onLogoClick={onNavigateHome ?? (() => {})}
      dataModule="manuscripts"
    >
      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h1 className="text-xl font-semibold">Projects</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus />
            New Project
          </Button>
        </header>

        {/* Toolbar */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "all" | "archived")}
          >
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 pl-8 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <LoadingState />
          ) : filteredProjects.length === 0 ? (
            <EmptyState isArchived={activeTab === "archived"} />
          ) : (
            <>
              {/* Desktop: Table view */}
              <div className="hidden md:block">
                <ProjectTable
                  projects={filteredProjects}
                  onOpenProject={handleOpenProject}
                  onRename={setRenameProject}
                  onDownload={handleDownloadProject}
                  onArchive={handleArchiveProject}
                  onDelete={setDeleteProject}
                />
              </div>

              {/* Mobile: Card view */}
              <div className="flex flex-col gap-3 md:hidden">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpenProject={handleOpenProject}
                    onRename={setRenameProject}
                    onDownload={handleDownloadProject}
                    onArchive={handleArchiveProject}
                    onDelete={setDeleteProject}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateProject}
      />

      <RenameProjectDialog
        project={renameProject}
        open={!!renameProject}
        onOpenChange={(open) => !open && setRenameProject(null)}
        onRename={handleRenameProject}
      />

      <DeleteConfirmDialog
        project={deleteProject}
        open={!!deleteProject}
        onOpenChange={(open) => !open && setDeleteProject(null)}
        onConfirm={handleDeleteProject}
      />
    </AppLayout>
  )
}
