import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { Reference } from "@/common/types";
import { Tag } from "@/components/ui/Tag";
import {
	DocumentTextIcon,
	PencilIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";

const referenceCardVariants = cva(
	"group relative rounded-lg border p-4 transition-all cursor-pointer",
	{
		variants: {
			selected: {
				true: "bg-accent/5 border-l-4 border-l-accent shadow-sm",
				false: "border-border hover:bg-bg-hover hover:shadow-md",
			},
		},
		defaultVariants: {
			selected: false,
		},
	}
);

interface ReferenceCardProps extends VariantProps<typeof referenceCardVariants> {
	reference: Reference;
	isSelected: boolean;
	onSelect: (id: string) => void;
	onClick: (id: string) => void;
}

export const ReferenceCard = React.forwardRef<
	HTMLDivElement,
	ReferenceCardProps
>(({ reference, isSelected, onSelect, onClick, ...props }, ref) => {
	const formatAuthors = (authors: Reference["authors"]): string => {
		if (!authors || authors.length === 0) return "Unknown";
		const first = authors[0];
		if (!first) return "Unknown";

		if (authors.length === 1) return first.full || first.family || "Unknown";

		const second = authors[1];
		if (authors.length === 2 && second) {
			const firstAuthor = first.full || first.family || "Unknown";
			const secondAuthor = second.full || second.family || "Unknown";
			return `${firstAuthor} & ${secondAuthor}`;
		}

		return `${first.full || first.family || "Unknown"} et al.`;
	};

	const handleClick = (e: React.MouseEvent): void => {
		if ((e.target as HTMLElement).closest("button")) {
			return;
		}
		onClick(reference._id);
	};

	const handleSelectClick = (e: React.MouseEvent): void => {
		e.stopPropagation();
		onSelect(reference._id);
	};

	return (
		<div
			ref={ref}
			className={twMerge(referenceCardVariants({ selected: isSelected }))}
			onClick={handleClick}
			{...props}
		>
			{/* Selection checkbox */}
			<div className="absolute left-2 top-2">
				<input
					checked={isSelected}
					className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
					type="checkbox"
					onClick={handleSelectClick}
					onChange={() => {}}
				/>
			</div>

			{/* Hover actions (top-right) */}
			<div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					className="rounded p-1 text-text-secondary hover:bg-bg-surface hover:text-text-primary"
					title="Edit reference"
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						// TODO: Open edit modal
					}}
				>
					<PencilIcon className="h-4 w-4" />
				</button>
				<button
					className="rounded p-1 text-text-secondary hover:bg-bg-surface hover:text-danger"
					title="Delete reference"
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						// TODO: Delete reference
					}}
				>
					<TrashIcon className="h-4 w-4" />
				</button>
			</div>

			{/* Main content */}
			<div className="mt-2 space-y-2">
				{/* Title */}
				<h3 className="pr-16 text-base font-medium text-text-primary">
					{reference.title}
				</h3>

				{/* Authors */}
				<p className="text-sm text-text-secondary">
					{formatAuthors(reference.authors)}
				</p>

				{/* Metadata badges */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Year */}
					{reference.year && (
						<span className="rounded bg-bg-surface px-2 py-0.5 text-xs text-text-secondary">
							{reference.year}
						</span>
					)}

					{/* Type */}
					<span className="rounded bg-bg-surface px-2 py-0.5 text-xs capitalize text-text-secondary">
						{reference.type}
					</span>

					{/* PDF indicator */}
					{reference.hasPdf && (
						<span
							className="flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-xs text-accent"
							title="PDF attached"
						>
							<DocumentTextIcon className="h-3 w-3" />
							PDF
						</span>
					)}

					{/* DOI badge */}
					{reference.doi && (
						<span className="rounded bg-bg-surface px-2 py-0.5 text-xs text-text-muted">
							DOI
						</span>
					)}
				</div>

				{/* Tags */}
				{reference.tags && reference.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 pt-1">
						{reference.tags.slice(0, 3).map((tag) => (
							<Tag key={tag} label={tag} size="sm" />
						))}
						{reference.tags.length > 3 && (
							<span className="text-xs text-text-muted">
								+{reference.tags.length - 3} more
							</span>
						)}
					</div>
				)}

				{/* Citation key (small, muted) */}
				<p className="text-xs text-text-muted">{reference.citationKey}</p>
			</div>
		</div>
	);
});

ReferenceCard.displayName = "ReferenceCard";
