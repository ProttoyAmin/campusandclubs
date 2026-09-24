import { NavLink, useLocation } from "react-router-dom";
import type { MenuItemType } from "@/config/menu/main-menu";

interface NavTabsProps {
  menu: MenuItemType[];
  className?: string;
  itemsClassName?: string;
  variant?: "tab" | "link" | "default";
  onlyIcon?: boolean;
  avatar?: string;
  id?: string;
}

const NavTabs = ({ menu, className, itemsClassName, avatar, id, variant = "default", onlyIcon = false }: NavTabsProps) => {
  const { pathname } = useLocation();

  const getIcon = (item: MenuItemType, active: boolean) => {
    if (active && item.iconActive) {
      return typeof item.iconActive === "function"
        ? item.iconActive(avatar || "")
        : item.iconActive;
    }
    return item.icon;
  };

  const renderLabel = (item: MenuItemType) => {
    if (onlyIcon) return null;
    return item.label;
  };

  const classes = (variant: string) => {
    switch (variant) {
      case "tab":
        return "w-full text-sm rounded-t-md p-2 font-medium transition-colors hover:text-secondary-foreground hover:bg-secondary";
      case "link":
        return "";
      case "default":
        return "border w-full text-sm p-2 rounded-md font-medium transition-colors hover:text-secondary-foreground hover:bg-secondary";
    }
  }

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
              className={`${classes(variant)} ${active && !onlyIcon
                ? `text-secondary-foreground w-fit ${variant === "tab" ? "border-b border-foreground" : "bg-secondary"}`
                : "text-muted-foreground border-b-2 border-transparent"
                }`}
            >
              <span className={`flex gap-2 items-center  ${itemsClassName}`}>{getIcon(item, active)} {renderLabel(item)}</span>
            </NavLink>
          </>
        );
      })}
    </nav>
  );
};

export default NavTabs;
