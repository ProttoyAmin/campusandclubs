import NavTabs from "@/components/nav-tabs";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenuButton,
    SidebarTrigger,
    SidebarSeparator
} from "design/components/ui/sidebar";
import ResponsiveDialog from "./responsive-dialog";
import ClubCreateForm from "@/features/club/forms/create-club-form";
import { userMenu } from "@/config/menu/main-menu";
import type { ClubCreateRequestWritable, ClubDetail } from "@campus/api";
import { useClubs, useDepartmentTemplates } from "@/features/club/hooks/club.hooks";
import { useAffiliations, useMe } from "@/features/user/hooks/user.hooks";
import React from "react";
import { toast } from "design/components/ui/toast";
import { Plus } from "lucide-react";
import { clubMenu } from "@/config/menu/club-menu";
import SidebarDropDown from "@/components/sidebar-dropdown";
import { SettingsDropdownMenu } from "@/config/menu/settings-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { MenuTwoLineIcon } from "@hugeicons/core-free-icons";
import { Button } from "design/components/ui/button";
import { useSidebar } from "design/components/ui/sidebar";

// interface AppSideBarProps {
//     main?: boolean;
//     className?: string;
//     menu?: (param: any) => MenuItemType[];
//     menuParam?: any;
// }


export function AppSidebar() {
    const [isCreating, setIsCreating] = React.useState<boolean>(false);
    const { data: currentUser } = useMe();
    const { data: affiliations } = useAffiliations();
    const { data: templates, isPending: templatesIsPending } = useDepartmentTemplates();
    const { create } = useClubs();
    const {
        state
    } = useSidebar()
    const clubs: Pick<ClubDetail, "id" | "slug" | "name">[] =
        // @ts-ignore
        // TODO: Fix the type later (priority:low)
        currentUser?.clubs || [];

    const handleClubCreate = async (data: ClubCreateRequestWritable) => {
        console.log(data)
        await create.mutateAsync(data, {
            onSuccess: () => {
                toast.add({
                    title: "Club created successfully",
                    type: "success",
                });
                setIsCreating(false);
            },
            onError: (error) => {
                toast.add({
                    title: "Failed to create club",
                    type: "error",
                    description: error.response?.data?.detail,
                });
            },
        });
    };

    return (
        <Sidebar collapsible="icon" className="bg-background">
            <SidebarHeader children={<>
                <div className="flex items-center justify-end gap-2">
                    <SidebarTrigger />
                </div>
            </>} className="bg-background" />
            <SidebarContent className="bg-background">
                <SidebarGroup children={
                    <>
                        <div className="flex flex-col gap-2 truncate">
                            <NavTabs
                                menu={userMenu(currentUser?.username || "")}
                                className="flex flex-row md:flex-col gap-2"
                                showToolTip
                            />
                        </div>
                    </>
                } />
                <SidebarGroup children={
                    <>
                        <ResponsiveDialog
                            open={isCreating}
                            showCloseButton={false}
                            onOpenChange={setIsCreating}
                            trigger={
                                <SidebarMenuButton tooltip={"Start a club"}>
                                    <Plus /> Start a club
                                </SidebarMenuButton>
                            }
                        >
                            <ClubCreateForm
                                onSubmit={handleClubCreate}
                                affiliations={affiliations || []}
                                templates={templates || []}
                                isPending={create.isPending || templatesIsPending}
                            />
                        </ResponsiveDialog>
                    </>
                } />
                {/* <SidebarSeparator /> */}
                <SidebarGroup children={
                    <>
                        <div className="flex flex-col gap-2 truncate">
                            <SidebarGroupLabel children={
                                <span className="">Clubs</span>
                            } />
                            {clubs && clubs.map((club: any) => (
                                <NavTabs
                                    key={club?.id}
                                    menu={clubMenu(club?.id, club.avatar, club.slug, club.name)}
                                    className=""
                                    showToolTip
                                />
                            ))}
                        </div>
                    </>
                } />
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter className="bg-background" children={
                <>
                    <div className="">
                        <SidebarDropDown
                            menu={SettingsDropdownMenu}
                            trigger={
                                <Button variant="ghost" className={`${state === "collapsed" ? "px-0" : ""}`}>
                                    <HugeiconsIcon icon={MenuTwoLineIcon} className="size-6" />
                                </Button>
                            }
                        />
                    </div>
                </>
            } />
        </Sidebar>
    )
}