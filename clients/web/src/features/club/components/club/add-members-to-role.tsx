import React from "react";
import { useMembers } from "../../hooks/membership.hooks";
import { Checkbox } from "design/components/ui/checkbox";
import { useDebouncedValue } from "@/shared/hooks/use-debounced";
import MembersSearchInput from "./member-search-input";
import { Button } from "design/components/ui/button";

const AddMembersToRole = ({ clubId }: { clubId: string }) => {
    const { data } = useMembers(clubId);
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [query, setQuery] = React.useState("");
    const debouncedQuery = useDebouncedValue(query, 300);

    const allMembers = data?.results?.members ?? [];

    // Client-side filter until the search endpoint exists
    const filtered = React.useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return allMembers;
        return allMembers.filter(
            (m) =>
                m.username.toLowerCase().includes(q) ||
                m.email?.toLowerCase().includes(q),
        );
    }, [allMembers, debouncedQuery]);

    const toggle = (id: string, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    // "Select all" applies only to the currently visible (filtered) members
    const selectedInView = filtered.filter((m) => selected.has(m.id)).length;
    const allInViewSelected = filtered.length > 0 && selectedInView === filtered.length;
    const someInViewSelected = selectedInView > 0 && !allInViewSelected;

    const toggleAllInView = (checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            filtered.forEach((m) => (checked ? next.add(m.id) : next.delete(m.id)));
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <MembersSearchInput clubId={clubId} onChange={(memberIds) => setSelected(new Set(memberIds))} />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <label className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                        checked={allInViewSelected}
                        indeterminate={someInViewSelected}
                        onCheckedChange={toggleAllInView}
                        disabled={filtered.length === 0}
                    />
                    Select all
                </label>
                <span>{selected.size} selected</span>
            </div>

            <ul className="flex flex-col gap-2.5">
                {filtered.length === 0 ? (
                    <li className="text-sm text-muted-foreground text-center py-4">
                        No members found
                    </li>
                ) : (
                    filtered.map((member) => (
                        <li key={member.id}>
                            <label className="border rounded-md flex items-center gap-2.5 p-2 cursor-pointer hover:bg-accent/50">
                                <Checkbox
                                    checked={selected.has(member.id)}
                                    onCheckedChange={(checked) => toggle(member.id, checked)}
                                />
                                {member.username}
                            </label>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default AddMembersToRole;