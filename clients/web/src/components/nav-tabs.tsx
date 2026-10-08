import { NavLink, useLocation } from "react-router-dom";
import type { MenuItemType } from "@/config/menu/main-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "design/components/ui/sidebar";
import { unLink } from "@/utils/link";

interface NavTabsProps {
  menu: MenuItemType[];
  className?: string;
  itemsClassName?: string;
  variant?: "tab" | "link" | "default";
  onlyIcon?: boolean;
  avatar?: string;
  id?: string;
  showToolTip?: boolean
}

const NavTabs = ({ menu, className, itemsClassName, avatar, id, variant = "default", onlyIcon = false, showToolTip = false }: NavTabsProps) => {
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
        return `p-2 hover:bg-secondary rounded-md`;
      case "link":
        return "";
      case "default":
        return "w-full text-sm rounded-md font-medium transition-colors";
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
            >
              <SidebarMenu>
                <SidebarMenuItem key={unLink(item.link)}
                  className={`${classes(variant)} ${active && !onlyIcon
                    ? `text-secondary-foreground ${variant === "tab" ? "bg-secondary" : "bg-secondary"}`
                    : "text-muted-foreground"
                    }`}>
                  <SidebarMenuButton tooltip={showToolTip ? item.label : undefined} className="gap-2.5">
                    {item.icon && <span className="flex size-4 shrink-0 items-center justify-center">
                      {getIcon(item, active)}
                    </span>}
                    <span className="truncate">
                      {renderLabel(item)}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </NavLink>
          </>
        );
      })}
    </nav>
  );
};

export default NavTabs;
