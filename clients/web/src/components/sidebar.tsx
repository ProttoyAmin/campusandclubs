import { paths } from "@/settings/routes";
import type React from "react";
import { Link } from "react-router-dom";
import NavTabs from "./nav-tabs";
import { userMenu } from "@/config/menu/main-menu";
import { ModeToggle } from "@/shared/components/mode-toggle";

const SideBar: React.FC = () => {
  return (
    <header className="min-h-screen p-4 sticky top-0 left-0 flex flex-col justify-between items-left">
      <Link to={paths.public.home} className="col-span-1 max-w-fit">
        CampusandCubs
      </Link>
      <div className="">
        <NavTabs menu={userMenu("userId")} className="flex flex-col space-y-2" />
      </div>
      <div className="">
        <ModeToggle />
      </div>
    </header>
  );
};

export default SideBar;
