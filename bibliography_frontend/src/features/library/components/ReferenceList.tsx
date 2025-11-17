import React from "react";
import { useLibraryStore } from "../store/library.store";
import { useUIStore } from "@/store/ui.store";
import type { Reference } from "@/common/types";
import { ReferenceCard } from "./ReferenceCard";

interface ReferenceListProps {
	references: Array<Reference>;
}

export function ReferenceList({ references }: ReferenceListProps): React.ReactElement {
	const selectedReferenceIds = useLibraryStore(
		(state) => state.selectedReferenceIds
	);
	const toggleSelection = useLibraryStore((state) => state.toggleSelection);
	const setActiveReference = useLibraryStore(
		(state) => state.setActiveReference
	);
	const setDetailsPaneOpen = useUIStore((state) => state.setDetailsPaneOpen);

	const handleCardClick = (id: string): void => {
		setActiveReference(id);
		setDetailsPaneOpen(true);
	};

	const handleCardSelect = (id: string): void => {
		toggleSelection(id);
	};

	if (references.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-app-text-muted">
				<p>No references found. Create your first reference to get started.</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{references.map((reference) => (
				<ReferenceCard
					key={reference._id}
					isSelected={selectedReferenceIds.has(reference._id)}
					reference={reference}
					onClick={handleCardClick}
					onSelect={handleCardSelect}
				/>
			))}
		</div>
	);
}
