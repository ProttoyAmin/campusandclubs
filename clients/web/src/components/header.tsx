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
import { useInstitutes } from '@/features/institute/hooks/institute.hooks';
import { useClubs, useDepartmentTemplates } from '@/features/club/hooks/club.hooks';
import { Plus } from 'lucide-react';

const Header = () => {
    const [open, setOpen] = React.useState(false);
    const [isCreating, setIsCreating] = React.useState<boolean>(false);
    const { institutes } = useInstitutes("id, name, code");
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
            <header className='p-4 flex items-center justify-between'>
                <div className="">
                    <AppDrawer open={open} onOpenChange={setOpen}
                        trigger={
                            <Button variant="ghost">
                                <HugeiconsIcon icon={Menu09Icon} className="size-6" />
                            </Button>
                        }
                    >
                        <Menu items={SettingsDropdownMenu()}></Menu>
                        <ResponsiveDialog
                            open={isCreating}
                            onOpenChange={setIsCreating}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="default"
                                    className={
                                        "rounded-md font-medium transition-colors w-full text-muted-foreground border-transparent self-start"
                                    }
                                >
                                    <Plus /> Start a club
                                </Button>
                            }
                        >
                            <ClubCreateForm
                                onSubmit={handleClubCreate}
                                institutes={institutes?.data?.results}
                                templates={templates}
                                isPending={create.isPending || templatesIsPending}
                            />
                        </ResponsiveDialog>
                    </AppDrawer>
                </div>
                <h1 className="text-xl font-bold text-accent-foreground">
                    campusandclubs
                </h1>
                <Button size={"icon"} variant='ghost'>
                    <HugeiconsIcon icon={Search01Icon} className="size-6" />
                </Button>
            </header>
        </>
    )
}

export default Header