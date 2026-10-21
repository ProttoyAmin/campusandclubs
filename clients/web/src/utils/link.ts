import type { MenuItemType } from "@/config/menu/main-menu";

export const unLink = (item: MenuItemType["link"]) => {
    const link = typeof item === "function" ? item("") : item;
    return link;
};