import { paths } from "@/settings/routes";
import React from "react";
import { Link } from "react-router-dom";
import NavTabs from "./nav-tabs";
import { userMenu, type MenuItemType } from "@/config/menu/main-menu";
import { Ellipsis, Plus } from "lucide-react";
import { Button } from "design/components/ui/button";
import SidebarDropDown from "@/components/sidebar-dropdown";
import { SettingsDropdownMenu } from "@/config/menu/settings-menu";
import { useMe } from "@/features/user/hooks/user.hooks";
import { clubMenu } from "@/config/menu/club-menu";
import type { ClubCreateRequestWritable, ClubDetail } from "@campus/api";
import AppDialog from "@/shared/components/app-dialog";
import ClubCreateForm from "@/features/club/forms/create-club-form";
import { useInstitutes } from "@/features/institute/hooks/institute.hooks";
import {
  useClubs,
  useDepartmentTemplates,
} from "@/features/club/hooks/club.hooks";
import { toast } from "design/components/ui/toast";

interface SideBarProps {
  main?: boolean;
  className?: string;
  menu?: (param: any) => MenuItemType[];
  menuParam?: any;
}

const SideBar: React.FC<SideBarProps> = (props) => {
  const [isCreating, setIsCreating] = React.useState<boolean>(false);
  const { data: currentUser } = useMe();
  const { institutes } = useInstitutes("id, name, code");
  const { data: templates, isPending: templatesIsPending } = useDepartmentTemplates();
  const { create } = useClubs();
  const clubs: Pick<ClubDetail, "id" | "slug" | "name">[] =
    // @ts-ignore
    // TODO: Fix the type later (priority:low)
    currentUser?.clubs || [];

  const handleClubCreate = async (data: ClubCreateRequestWritable) => {
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

  if (props.main) {
    return (
      <header
        className={`h-screen p-4 flex flex-col justify-between items-left ${props.className}`}
      >
        <Link to={paths.public.home} className="col-span-1">
          CQlubs
        </Link>
        <div className="flex flex-col gap-2">
          <NavTabs
            menu={userMenu(currentUser?.username || "")}
            className="flex flex-row md:flex-col space-y-2 w-full self-start"
          />
          <AppDialog
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
          </AppDialog>
        </div>
        <div className="flex flex-col space-y-2">
          <h1 className="text-muted-foreground text-xs">Clubs</h1>
          {clubs &&
            clubs.map((club: any) => (
              <NavTabs
                key={club?.club_id}
                menu={clubMenu(club.club_id, club.club_name, club.club_slug)}
                className="flex flex-row md:flex-col space-y-2 w-full self-start"
              />
            ))}
        </div>
        <div className="">
          <SidebarDropDown
            menu={SettingsDropdownMenu}
            trigger={
              <Button variant="ghost">
                <Ellipsis className="size-5" />
              </Button>
            }
          />
        </div>
      </header>
    );
  }

  return (
    <header className={`${props.className}`}>
      <NavTabs
        menu={props.menu ? props.menu(props.menuParam) : []}
        className="flex flex-row md:flex-col space-y-2 self-start"
      />
    </header>
  );
};

export default SideBar;
