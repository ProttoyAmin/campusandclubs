import { paths } from "@/settings/routes";
import type React from "react";
import { Link } from "react-router-dom";
import NavTabs from "./nav-tabs";
import { userMenu, type MenuItemType } from "@/config/menu/main-menu";
import { NavLink } from "react-router-dom";
import { MenuIcon } from "lucide-react";
import { Button } from "design/components/ui/button";
import SidebarDropDown from "@/components/sidebar-dropdown";
import { SettingsDropdownMenu } from "@/config/menu/settings-menu";
import { useMe } from "@/features/user/hooks/user.hooks";

interface SideBarProps {
  main?: boolean;
  className?: string;
  menu?: (param: any) => MenuItemType[];
  menuParam?: any;
}

const SideBar: React.FC<SideBarProps> = (props) => {
  const { data: currentUser } = useMe();
  const clubs: any = currentUser?.clubs || [];

  if (props.main) {
    return (
      <header
        className={`min-h-screen p-4 sticky top-0 left-0 flex flex-col justify-between items-left ${props.className}`}
      >
        <Link to={paths.public.home} className="col-span-1 max-w-fit">
          CampusandClubs
        </Link>
        <div className="">
          <NavTabs
            menu={userMenu(currentUser?.username || "")}
            className="flex flex-col space-y-2 w-5/6 self-start"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <h1 className="text-muted-foreground text-xs">Clubs</h1>
          {clubs &&
            clubs.map((club: any) => (
              <NavLink
                key={club.club_id}
                to={paths.public.club.slug(club.club_slug)}
                className="flex flex-col space-y-2 self-start"
              >
                {club?.club_name}
              </NavLink>
            ))}
        </div>
        <div className="">
          <SidebarDropDown
            menu={SettingsDropdownMenu}
            trigger={
              <Button variant="ghost">
                <MenuIcon className="size-5" />
                More
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
        className="flex flex-col space-y-2 self-start"
      />
    </header>
  );
};

export default SideBar;
