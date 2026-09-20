import { Search01Icon, Menu09Icon, MenuTwoLineIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from 'design/components/ui/button';
import React from 'react';
import ClubCreateForm from "@/features/club/forms/create-club-form";
import { SettingsDropdownMenu } from '@/config/menu/settings-menu';
import AppDrawer from '@/shared/components/app-drawer';
import Menu from '@/shared/components/menu';
import ResponsiveDialog from '@/shared/components/responsive-dialog';
import type { ClubCreateRequestWritable } from '@campus/api';
import { useClubs, useDepartmentTemplates } from '@/features/club/hooks/club.hooks';
import { Plus } from 'lucide-react';
import { useAffiliations } from '@/features/user/hooks/user.hooks';

const Header = () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [createClubOpen, setCreateClubOpen] = React.useState(false);
    const { data: affiliations } = useAffiliations();
    const { create } = useClubs();
    const { data: templates, isPending: templatesIsPending } = useDepartmentTemplates();

    const handleClubCreate = async (data: ClubCreateRequestWritable) => {
        console.log(data)
        // await create.mutateAsync(data, {
        //   onSuccess: () => {
        //     toast.add({
        //       title: "Club created successfully",
        //       type: "success",
        //     });
        //     setIsCreating(false);
        //   },
        //   onError: (error) => {
        //     toast.add({
        //       title: "Failed to create club",
        //       type: "error",
        //       description: error.response?.data?.detail,
        //     });
        //   },
        // });
    };

    return (
        <>
            <header className="p-4 flex items-center justify-between">
                <AppDrawer
                    open={menuOpen}
                    onOpenChange={setMenuOpen}
                    trigger={
                        <Button variant="ghost">
                            <HugeiconsIcon
                                icon={Menu09Icon}
                                className="size-6"
                            />
                        </Button>
                    }
                >
                    <Menu items={SettingsDropdownMenu()} />

                    <Button
                        variant="ghost"
                        size="default"
                        className="w-full rounded-md font-medium text-muted-foreground"
                        onClick={() => {
                            setMenuOpen(false);
                            setCreateClubOpen(true);
                        }}
                    >
                        <Plus />
                        Start a club
                    </Button>
                </AppDrawer>

                <h1 className="text-xl font-bold text-accent-foreground">
                    campusandclubs
                </h1>

                <Button size="icon" variant="ghost">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        className="size-6"
                    />
                </Button>
            </header>

            {/* Second overlay lives outside AppDrawer */}
            <ResponsiveDialog
                open={createClubOpen}
                onOpenChange={setCreateClubOpen}
                title="Start a club"
            >
                <ClubCreateForm
                    onSubmit={handleClubCreate}
                    affiliations={affiliations}
                    templates={templates}
                    isPending={
                        create.isPending || templatesIsPending
                    }
                />
            </ResponsiveDialog>
        </>
    )
}

export default Header