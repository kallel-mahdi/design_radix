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
import { useDeleteReferenceMutation } from "@/features/library/api/references.queries";
import { useUIStore } from "@/store/ui.store";

const referenceCardVariants = cva(
	"group relative rounded-lg border p-4 transition-all cursor-pointer",
	{
		variants: {
			selected: {
				true: "bg-app-accent/5 border-l-4 border-l-app-accent shadow-sm",
				false: "border-app-border hover:bg-app-bg-hover hover:shadow-md",
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
	const deleteMutation = useDeleteReferenceMutation();
	const addToast = useUIStore((state) => state.addToast);

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

	const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		e.stopPropagation();
		onSelect(reference._id);
	};

	const handleEdit = (e: React.MouseEvent): void => {
		e.stopPropagation();
		// TODO: Implement edit modal in Session 8 (Forms & Modals)
		addToast({
			message: 'Edit feature coming in Session 8',
			type: 'info',
		});
	};

	const handleDelete = (e: React.MouseEvent): void => {
		e.stopPropagation();
		deleteMutation.mutate(reference._id);
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
					className="h-4 w-4 rounded border-app-border text-app-accent focus:ring-app-accent"
					type="checkbox"
					onChange={handleSelectChange}
				/>
			</div>

			{/* Hover actions (top-right) */}
			<div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					className="rounded p-1 text-app-text-secondary hover:bg-app-surface hover:text-app-text-primary"
					title="Edit reference"
					type="button"
					onClick={handleEdit}
				>
					<PencilIcon className="h-4 w-4" />
				</button>
				<button
					className="rounded p-1 text-app-text-secondary hover:bg-app-surface hover:text-danger"
					title="Delete reference"
					type="button"
					onClick={handleDelete}
				>
					<TrashIcon className="h-4 w-4" />
				</button>
			</div>

			{/* Main content */}
			<div className="mt-2 space-y-2">
				{/* Title */}
				<h3 className="pr-16 text-base font-medium text-app-text-primary">
					{reference.title}
				</h3>

				{/* Authors */}
				<p className="text-sm text-app-text-secondary">
					{formatAuthors(reference.authors)}
				</p>

				{/* Metadata badges */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Year */}
					{reference.year && (
						<span className="rounded bg-app-surface px-2 py-0.5 text-xs text-app-text-secondary">
							{reference.year}
						</span>
					)}

					{/* Type */}
					<span className="rounded bg-app-surface px-2 py-0.5 text-xs capitalize text-app-text-secondary">
						{reference.type}
					</span>

					{/* PDF indicator */}
					{reference.hasPdf && (
						<span
							className="flex items-center gap-1 rounded bg-app-accent/10 px-2 py-0.5 text-xs text-app-accent"
							title="PDF attached"
						>
							<DocumentTextIcon className="h-3 w-3" />
							PDF
						</span>
					)}

					{/* DOI badge */}
					{reference.doi && (
						<span className="rounded bg-app-surface px-2 py-0.5 text-xs text-app-text-muted">
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
							<span className="text-xs text-app-text-muted">
								+{reference.tags.length - 3} more
							</span>
						)}
					</div>
				)}

				{/* Citation key (small, muted) */}
				<p className="text-xs text-app-text-muted">{reference.citationKey}</p>
			</div>
		</div>
	);
});

ReferenceCard.displayName = "ReferenceCard";
