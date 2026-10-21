import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/use-debounced";
import { accounts } from "@/features/user/services/account.service";
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
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "design/components/ui/avatar"
import type { UserMinimal } from '@campus/api';

interface UserSearchInputProps {
    users: UserMinimal[];
    setUsers: React.Dispatch<React.SetStateAction<UserMinimal[]>>
    selectedUsers: UserMinimal[];
    setSelectedUsers: React.Dispatch<React.SetStateAction<UserMinimal[]>>
}

const UsersSearchInput = ({ selectedUsers, setSelectedUsers, users, setUsers }: UserSearchInputProps) => {
    const [query, setQuery] = React.useState("");

    const anchor = useComboboxAnchor();

    const debouncedQuery = useDebouncedValue(query, 600);

    const { data } = useQuery({
        queryKey: ["users", "search", debouncedQuery],
        queryFn: () => accounts.search(debouncedQuery),
        enabled: debouncedQuery.trim().length > 0,
    });

    React.useEffect(() => {
        if (data?.results) {
            setUsers((prev) => [...prev, ...data.results]);
        }
    }, [data]);

    return (
        <Combobox
            multiple
            autoHighlight
            items={users}
            value={selectedUsers}
            onValueChange={setSelectedUsers}
            isItemEqualToValue={(item, value) => item.id === value.id}
        >
            <ComboboxChips ref={anchor} className="w-full rounded-full">
                <ComboboxValue>
                    {(values: UserMinimal[]) => (
                        <>
                            {values?.map((user) => (
                                <ComboboxChip key={user.id} className={"gap-2 border rounded-4xl md:h-10"}>
                                    <Avatar className={"md:size-8 size-5"}>
                                        <AvatarImage src={user.avatar ?? undefined} />
                                        <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className='text-xs'>{user.username}</span>
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={`${values.length === 0 ? "Search..." : ""}`}
                                className={"md:h-full h-10 w-full text-lg md:rounded-none rounded-4xl"}
                                autoFocus
                            />
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor} className={'md:max-h-96 max-h-40'}>
                <ComboboxEmpty>{query.length === 0 ? "Type to search users" : "No users found"}</ComboboxEmpty>
                <ComboboxList className={"animate-[revealFromTop_0.3s_ease-out]"}>
                    {(item: UserMinimal) => (
                        <ComboboxItem key={item.id} value={item} className={"md:h-16"}>
                            <Avatar size="lg">
                                <AvatarImage src={item.avatar ?? undefined} />
                                <AvatarFallback>{item.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {item.username}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};
export default UsersSearchInput