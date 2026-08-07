import { paths } from "@/settings/routes";
import type React from "react";
import { Link } from "react-router-dom";
import NavTabs from "./nav-tabs";
import { userMenu } from "@/config/menu/main-menu";
import { ModeToggle } from "@/shared/components/mode-toggle";
import { useSession } from "@/features/auth/hooks";
import { NavLink } from "react-router-dom";

const SideBar: React.FC = () => {
  const { data: currentUser } = useSession();
  const clubs: any = currentUser?.clubs || [];
  return (
    <header className="min-h-screen p-4 sticky top-0 left-0 flex flex-col justify-between items-left">
      <Link to={paths.public.home} className="col-span-1 max-w-fit">
        CampusandClubs
      </Link>
      <div className="">
        <NavTabs
          menu={userMenu(currentUser?.username || "")}
          className="flex flex-col space-y-2"
        />
      </div>
      <div className="flex flex-col space-y-2">
        <h1 className="text-muted-foreground text-xs">Clubs</h1>
        {clubs &&
          clubs.map((club: any) => (
            <NavLink
              key={club.club_id}
              to={paths.public.club.slug(club.club_slug)}
              className="flex flex-col space-y-2"
            >
              {club.club_slug}
            </NavLink>
          ))}
      </div>
      <div className="">
        <ModeToggle />
      </div>
    </header>
  );
};

export default SideBar;
