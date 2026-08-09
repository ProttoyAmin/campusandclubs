import { paths } from "@/settings/routes";
import type React from "react";
import { Link } from "react-router-dom";
import NavTabs from "./nav-tabs";
import { userMenu } from "@/config/menu/main-menu";
import { ModeToggle } from "@/shared/components/mode-toggle";
import { useSession } from "@/features/auth/hooks";
import { NavLink } from "react-router-dom";
import { clubConfigureMenu } from "@/config/menu/club-configure-menu";
import { useParams } from "react-router-dom";

interface SideBarProps {
  for: "club" | "user";
}

const SideBar: React.FC<SideBarProps> = (props) => {
  const { data: currentUser } = useSession();
  const { slug } = useParams();
  const clubs: any = currentUser?.clubs || [];

  if (props.for === "club") {
    return (
      <NavTabs
        menu={clubConfigureMenu(slug || "")}
        className="flex flex-col space-y-2 self-start"
      />
    );
  }

  return (
    <header className="min-h-screen p-4 sticky top-0 left-0 flex flex-col justify-between items-left">
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
