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
        return `p-1 hover:bg-secondary rounded-xl`;
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

        if (variant === "tab") {
          const showLabel = !onlyIcon;
          return (
            <NavLink
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              to={link}
              end
              aria-label={item.label}
              className={`flex items-center rounded-full p-2 transition-all duration-300 ${active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary active:not-aria-[haspopup]:scale-95"
                } ${itemsClassName ?? ""}`}

            // className={`border-b flex items-center p-2 transition-all duration-300 ${active
            //   ? "border-b-2 border-b-accent-foreground text-secondary-foreground"
            //   : "text-muted-foreground active:not-aria-[haspopup]:scale-95"
            //   } ${itemsClassName ?? ""}`}

            >
              {item.icon && <span className="flex size-5 shrink-0 items-center justify-center">
                {getIcon(item, active)}
              </span>}
              <span
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${showLabel ? "grid-cols-[1fr] opacity-100" : "ml-0 grid-cols-[0fr] opacity-0"
                  }`}
              >
                <span className="overflow-hidden whitespace-nowrap text-sm font-semibold">
                  {renderLabel(item)}
                </span>
              </span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.id}
            id={`sidebar-nav-${item.id}`}
            to={link}
            end
          >
            <SidebarMenu>
              <SidebarMenuItem key={unLink(item.link)}
                className={`${classes(variant)} ${active && !onlyIcon
                  ? `text-secondary-foreground bg-secondary`
                  : "text-muted-foreground"
                  } ${itemsClassName}`}>
                <SidebarMenuButton tooltip={showToolTip ? item.label : undefined} className="gap-3">
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
        );
      })}
    </nav>
  );
};

export default NavTabs;
