import React from "react";
import { useMembers, useMembership } from "../../hooks/membership.hooks";
import { useDebouncedValue } from "@/shared/hooks/use-debounced";
import type { Member } from "../../http/membership.http";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "design/components/ui/combobox";
import { Avatar, AvatarImage, AvatarFallback } from "design/components/ui/avatar";

type AddMembersToRoleProps = {
    clubId: string;
    onChange?: (memberIds: string[]) => void;
};

const AddMembersToRole = ({ clubId, onChange }: AddMembersToRoleProps) => {
    const anchor = useComboboxAnchor();
    // const { data } = useMembers(clubId);
    const [query, setQuery] = React.useState("");
    const [selected, setSelected] = React.useState<Member[]>([]);
    const debouncedQuery = useDebouncedValue(query, 300);

    // const members = React.useMemo(() => data?.results?.members ?? [], [data]);

    // Client-side search until the endpoint exists.
    // Later: replace this memo with a useQuery keyed on [clubId, debouncedQuery].

    const { searchMembers } = useMembership();
    const { data: searchMembersData, isFetching } = searchMembers(clubId, debouncedQuery);

    const items = searchMembersData?.results?.members ?? [];
    // const items = React.useMemo(() => {
    //     const q = debouncedQuery.trim().toLowerCase();
    //     if (!q) return members;
    //     return members.filter(
    //         (m) =>
    //             m.username.toLowerCase().includes(q) ||
    //             m.email?.toLowerCase().includes(q),
    //     );
    // }, [members, debouncedQuery]);

    const handleChange = (next: Member[]) => {
        setSelected(next);
        onChange?.(next.map((m) => m.id));
    };

    return (
        <Combobox
            multiple
            autoHighlight
            filter={null} // we filter ourselves, so the combobox doesn't filter twice
            items={items}
            value={selected}
            onValueChange={handleChange}
            itemToStringValue={(m: Member) => m.username}
            isItemEqualToValue={(a: Member, b: Member) => a.id === b.id}
        >
            <ComboboxChips ref={anchor} className="w-full rounded-full">
                <ComboboxValue>
                    {(values: Member[]) => (
                        <>
                            {values.map((member) => (
                                <ComboboxChip
                                    key={member.id}
                                    className="gap-2 border rounded-4xl md:h-10"
                                >
                                    <Avatar className="md:size-8 size-5">
                                        <AvatarImage src={member.avatar ?? undefined} />
                                        <AvatarFallback>
                                            {member.username[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">{member.username}</span>
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={values.length === 0 ? "Search members..." : ""}
                                className="md:h-full h-10 w-full text-lg md:rounded-none rounded-4xl"
                            />
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>

            <ComboboxContent anchor={anchor} className="md:max-h-96 max-h-40">
                <ComboboxEmpty>{isFetching ? "Searching..." : "No members found"}</ComboboxEmpty>
                <ComboboxList>
                    {(item: Member) => (
                        <ComboboxItem key={item.id} value={item} className="md:h-16">
                            <Avatar size="lg">
                                <AvatarImage src={item.avatar ?? undefined} />
                                <AvatarFallback>
                                    {item.username[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {item.username}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};

export default AddMembersToRole;