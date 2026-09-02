import { NavLink, useLocation } from "react-router-dom";
import type { MenuItemType } from "@/config/menu/main-menu";

interface NavTabsProps {
  menu: MenuItemType[];
  className?: string;
  onlyIcon?: boolean;
  avatar?: string;
  id?: string;
}

const NavTabs = ({ menu, className, avatar, id, onlyIcon = false }: NavTabsProps) => {
  const { pathname } = useLocation();

  const renderLabel = (item: MenuItemType, active: boolean) => {
    if (!onlyIcon) return item.label;
    if (typeof item.icon === "function") return item.icon;
    if (onlyIcon && active) {
      return typeof item.iconActive === "function"
        ? item.iconActive(avatar || "")
        : item.iconActive || item.icon;
    }
    return item.icon;
  };

  return (
    <nav className={`${className}`}>
      {menu.map((item) => {
        const link =
          typeof item.link === "function" ? item.link(id || "") : item.link;
        const active = item.isActive(pathname);

        return (
          <>
            <NavLink
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              to={link}
              end
              className={`border w-full text-sm p-2 rounded-md font-medium transition-colors hover:text-secondary-foreground hover:bg-secondary ${active && !onlyIcon
                ? "text-secondary-foreground bg-secondary"
                : "text-muted-foreground border-b-2 border-transparent"
                }`}
            >
              <span className="flex gap-2 items-center">{item.icon} {renderLabel(item, active)}</span>
            </NavLink>
          </>
        );
      })}
    </nav>
  );
};

export default NavTabs;
