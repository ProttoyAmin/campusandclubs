// design/components/ui/sortable.tsx
"use client";

import * as React from "react";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import type { UniqueIdentifier } from "@dnd-kit/abstract";
import { GripVertical } from "lucide-react";
import { cn } from "../../lib/utils";

// `move` only reorders an array of ids — not your data objects — so this
// wrapper's contract is "give me the current id order, get the new id
// order back." Mapping ids back to full rows is the consumer's job.
interface SortableProps {
    ids: UniqueIdentifier[];
    onReorder: (next: UniqueIdentifier[]) => void;
    children: React.ReactNode;
}

export function Sortable({ ids, onReorder, children }: SortableProps) {
    const handleDragEnd = (event: DragEndEvent) => {
        onReorder(move(ids, event));
    };

    return <DragDropProvider onDragEnd={handleDragEnd}>{children}</DragDropProvider>;
}

interface SortableItemRenderProps {
    ref: (node: Element | null) => void;
    handleRef: React.RefObject<HTMLButtonElement | null>;
    isDragging: boolean;
}

interface SortableItemProps {
    id: UniqueIdentifier;
    index: number;
    children: (props: SortableItemRenderProps) => React.ReactNode;
}

export function SortableItem({ id, index, children }: SortableItemProps) {
    const handleRef = React.useRef<HTMLButtonElement | null>(null);
    const { ref, isDragging } = useSortable({ id, index, handle: handleRef });

    return <>{children({ ref, handleRef, isDragging })}</>;
}

export const DragHandle = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        className={cn(
            "cursor-grab touch-none text-muted-foreground active:cursor-grabbing",
            className
        )}
        {...props}
    >
        <GripVertical className="size-4" />
    </button>
));
DragHandle.displayName = "DragHandle";