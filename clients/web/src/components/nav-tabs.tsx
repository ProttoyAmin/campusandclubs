import { NavLink, useLocation } from "react-router-dom";
import type { MenuItemType } from "@/config/menu/main-menu";
import { cn } from "design/lib/utils";

interface NavTabsProps {
  menu: MenuItemType[];
  className?: string;
  itemsClassName?: string;
  variant?: "tab" | "link" | "default" | "nav" | "mobile";
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

  const classes = (variant: string, active: boolean) => {
    const activeCls = active ? "text-foreground" : "text-muted-foreground";
    switch (variant) {
      case "tab":
        return `w-full text-sm rounded-t-md p-3 font-medium transition-colors hover:text-foreground hover:bg-transparent ${activeCls} ${active ? "border-b-2 border-foreground" : "border-b-2 border-transparent"}`;
      case "link":
        return `w-full text-sm p-2 font-medium transition-colors ${activeCls}`;
      case "nav":
        return `w-full text-sm rounded-lg px-3 py-2 font-medium transition-colors hover:bg-secondary ${activeCls} ${active ? "bg-secondary text-foreground" : ""}`;
      case "mobile":
        return `w-full text-base rounded-lg px-4 py-3 font-medium transition-colors hover:bg-secondary border border-border/60 ${activeCls} ${active ? "bg-secondary" : ""}`;
      case "default":
      default:
        return `border w-full text-sm p-2 rounded-md font-medium transition-colors hover:text-secondary-foreground hover:bg-secondary ${active ? "text-secondary-foreground bg-secondary" : "text-muted-foreground"}`;
    }
  };

  return (
    <nav className={`${className}`}>
      {menu.map((item) => {
        const link =
          typeof item.link === "function" ? item.link(id || "") : item.link;
        const active = item.isActive(pathname);

        return (
          <NavLink
            key={item.id}
            id={`sidebar-nav-${item.id}`}
            to={link}
            end
            className={classes(variant, active)}
          >
            <span className={cn("flex gap-2 items-center", itemsClassName)}>{getIcon(item, active)} {renderLabel(item)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default NavTabs;
