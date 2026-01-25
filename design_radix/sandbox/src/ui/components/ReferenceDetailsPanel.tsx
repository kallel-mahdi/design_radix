import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  FileText,
  MessageSquare,
  User,
  Calendar,
  Building,
  Link,
  ExternalLink,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface Author {
  id: string;
  given: string;
  family: string;
}

interface Annotation {
  id: string;
  highlightedText: string;
  comment: string;
  pageNumber: number;
  date: string;
}

interface Reference {
  id: string;
  type: string;
  title: string;
  authors: Author[];
  authorsDisplay: string;
  year: string;
  venue: string;
  tags: { label: string; variant: string }[];
  hasFile: boolean;
  doi: string;
}

interface ReferenceDetailsPanelProps {
  reference: Reference;
  onClose: () => void;
}

// ============================================
// MOCK DATA
// ============================================
const mockAnnotations: Annotation[] = [
  {
    id: "1",
    highlightedText:
      "The key finding of our study is that plasticity loss occurs primarily in the early layers of deep reinforcement learning networks.",
    comment:
      "Important insight - this suggests early layer freezing might help preserve plasticity",
    pageNumber: 4,
    date: "Jan 15, 2025",
  },
  {
    id: "2",
    highlightedText:
      "We observe a 23% improvement in sample efficiency when using our proposed method.",
    comment: "Compare this with the results from Zhang et al. 2022",
    pageNumber: 7,
    date: "Jan 14, 2025",
  },
  {
    id: "3",
    highlightedText:
      "The reset mechanism appears to be crucial for maintaining network adaptability.",
    comment: "",
    pageNumber: 12,
    date: "Jan 12, 2025",
  },
];

// ============================================
// SUB-COMPONENTS
// ============================================

function LoadingState() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function AuthorField({
  author,
  onRemove,
}: {
  author: Author;
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
      <Input
        defaultValue={author.given}
        placeholder="First name"
        className="flex-1"
      />
      <Input
        defaultValue={author.family}
        placeholder="Last name"
        className="flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AnnotationCard({
  annotation,
  index,
  onClick,
}: {
  annotation: Annotation;
  index: number;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:border-primary animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Highlighted Text */}
        {annotation.highlightedText && (
          <div className="space-y-1.5">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Highlight
            </div>
            <div className="text-foreground text-sm leading-relaxed bg-amber-500/10 border-l-2 border-amber-500 rounded-r px-3 py-2">
              {annotation.highlightedText}
            </div>
          </div>
        )}

        {/* Comment */}
        {annotation.comment && (
          <div className="space-y-1.5">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Note
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              {annotation.comment}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Badge variant="outline" className="text-xs">
            Page {annotation.pageNumber}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {annotation.date}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyAnnotations() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
      <p className="text-muted-foreground text-sm">No annotations yet</p>
      <p className="text-muted-foreground text-xs mt-1">
        Open the PDF to add highlights and notes
      </p>
    </div>
  );
}

function InfoTab({
  reference,
  authors,
  onAddAuthor,
  onRemoveAuthor,
  isLoading,
}: {
  reference: Reference;
  authors: Author[];
  onAddAuthor: () => void;
  onRemoveAuthor: (index: number) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4 p-4 animate-in fade-in slide-in-from-left-2 duration-200">
      {/* Item Type */}
      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          Item Type
        </Label>
        <Select defaultValue={reference.type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="article">Journal Article</SelectItem>
            <SelectItem value="book">Book</SelectItem>
            <SelectItem value="chapter">Book Chapter</SelectItem>
            <SelectItem value="conference">Conference Paper</SelectItem>
            <SelectItem value="thesis">Thesis</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="text-xs">Title</Label>
        <Input defaultValue={reference.title} placeholder="Enter title" />
      </div>

      {/* Authors */}
      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-2">
          <User className="h-3.5 w-3.5" />
          Authors
        </Label>
        <div className="space-y-2">
          {authors.map((author, index) => (
            <AuthorField
              key={author.id}
              author={author}
              index={index}
              onRemove={() => onRemoveAuthor(index)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onAddAuthor}
          className="w-full text-primary hover:text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Author
        </Button>
      </div>

      {/* Year & Venue */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Year
          </Label>
          <Input defaultValue={reference.year} placeholder="2024" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-2">
            <Building className="h-3.5 w-3.5" />
            Venue
          </Label>
          <Input defaultValue={reference.venue} placeholder="Journal/Conference" />
        </div>
      </div>

      {/* DOI */}
      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-2">
          <Link className="h-3.5 w-3.5" />
          DOI / URL
        </Label>
        <Input defaultValue={reference.doi} placeholder="https://doi.org/..." />
      </div>

      {/* PDF Preview Placeholder */}
      {reference.hasFile && (
        <div className="space-y-2">
          <Label className="text-xs">PDF Preview</Label>
          <button
            type="button"
            className="w-full rounded-lg border border-border bg-muted/50 overflow-hidden cursor-pointer group transition-all duration-200 hover:border-primary hover:shadow-lg"
          >
            <div className="relative aspect-[3/4] flex items-center justify-center bg-muted">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200">
                <span className="opacity-0 group-hover:opacity-100 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium transform scale-95 group-hover:scale-100 transition-all duration-200 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open PDF
                </span>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function NotesTab({
  annotations,
  isLoading,
  onAnnotationClick,
}: {
  annotations: Annotation[];
  isLoading: boolean;
  onAnnotationClick: (annotation: Annotation) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (annotations.length === 0) {
    return <EmptyAnnotations />;
  }

  return (
    <div className="p-4 space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
      {annotations.map((annotation, index) => (
        <AnnotationCard
          key={annotation.id}
          annotation={annotation}
          index={index}
          onClick={() => onAnnotationClick(annotation)}
        />
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ReferenceDetailsPanel({
  reference,
  onClose,
}: ReferenceDetailsPanelProps) {
  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authors, setAuthors] = useState<Author[]>(
    reference?.authors || [
      { id: "1", given: "Julian", family: "Ash" },
      { id: "2", given: "Jordan", family: "Smith" },
    ]
  );

  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      { id: crypto.randomUUID(), given: "", family: "" },
    ]);
  };

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    console.log("Navigate to annotation:", annotation);
  };

  return (
    <div className="h-full bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header - h-11 matches ContentTabs height */}
      <div className="h-11 px-4 border-b border-border shrink-0 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
        <TabsList
          variant="line"
          className="w-full justify-center gap-0 px-4 border-b border-border rounded-none bg-transparent h-auto shrink-0"
        >
          <TabsTrigger
            value="info"
            className="flex-1 gap-2 py-3 rounded-none data-[state=active]:text-primary data-[state=active]:after:bg-primary"
          >
            <FileText className="h-4 w-4" />
            Info
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex-1 gap-2 py-3 rounded-none data-[state=active]:text-primary data-[state=active]:after:bg-primary"
          >
            <MessageSquare className="h-4 w-4" />
            Notes
            {mockAnnotations.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {mockAnnotations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Scrollable Content */}
        <TabsContent value="info" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <InfoTab
              reference={reference}
              authors={authors}
              onAddAuthor={handleAddAuthor}
              onRemoveAuthor={handleRemoveAuthor}
              isLoading={isLoading}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <NotesTab
              annotations={mockAnnotations}
              isLoading={isLoading}
              onAnnotationClick={handleAnnotationClick}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Sticky Footer */}
      <div className="border-t border-border p-4 shrink-0">
        <Button className="w-full" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
