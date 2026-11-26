import { useRoleLayoutOutlet } from "@/features/club/context/club-layout-context";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useState } from "react";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "design/components/ui/avatar";
import { Button } from "design/components/ui/button";
import { Input } from "design/components/ui/input";
import EmptyState from "@/shared/components/empty-state";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import AddMembersToRole from "../../../../components/club/add-members-to-role";


const RoleMembers = () => {
    const { role, club } = useRoleLayoutOutlet();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false)

    const filteredMemberships =
        role?.memberships.filter((m) =>
            m.member.username.toLowerCase().includes(search.toLowerCase())
        ) ?? [];

    return (
        <div className="space-y-4">
            {/* Rendered once regardless of empty state */}
            <div className="flex gap-2.5">
                <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <ResponsiveDialog
                    open={open}
                    onOpenChange={setOpen}
                    trigger={<Button>Add members</Button>} showCloseButton={false}>
                    <AddMembersToRole clubId={club.id} />
                    <div className="w-full flex items-center justify-between gap-2.5">
                        <Button variant="ghost" className={'w-1/2'} onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="outline" className={'w-1/2'} onClick={() => setOpen(false)}>Save</Button>
                    </div>
                </ResponsiveDialog>
            </div>

            {/* Single conditional branch below the search box */}
            {!role || filteredMemberships.length === 0 ? (
                <EmptyState
                    title=""
                    description={
                        search
                            ? "No members match your search."
                            : "This role has no members."
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 max-h-96 overflow-y-auto rounded-xl divide-y md:divide-y-0">
                    {filteredMemberships.map((membership, index) => (
                        <div
                            key={membership.id}
                            className={`w-full flex justify-between items-center p-4 border-border/50 ${index % 2 === 0 ? "md:border-r" : ""
                                } ${index < filteredMemberships.length - 2
                                    ? "md:border-b"
                                    : ""
                                }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="size-3.5 rounded-full shrink-0"
                                    style={{ backgroundColor: role.color }}
                                />
                                <div className="flex items-center gap-2.5">
                                    <React.Suspense
                                        fallback={
                                            <div className="size-8 rounded-full bg-muted animate-pulse" />
                                        }
                                    >
                                        <Avatar className="size-8">
                                            <AvatarImage
                                                src={
                                                    membership.member.avatar ??
                                                    undefined
                                                }
                                            />
                                            <AvatarFallback>
                                                {membership.member.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </React.Suspense>

                                    <p className="font-semibold text-sm">
                                        {membership.member.username}
                                    </p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon">
                                <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    className="size-5"
                                />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoleMembers;
