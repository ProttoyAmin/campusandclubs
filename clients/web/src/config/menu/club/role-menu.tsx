import { paths, routes } from "@/settings/routes";
import type { MenuItemType } from "../main-menu";
import { isRouteActive } from "@/utils/route";

export const ClubRoleMenu: (slug: string, roleId: string) => MenuItemType[] = (
    slug: string,
    roleId: string
) => [
        {
            id: 1,
            label: "Display",
            icon: "",
            iconActive: <></>,
            link: () => paths.private.club.roleDetail(roleId, slug),
            isActive: (currentPath) =>
                isRouteActive(routes.club.private.config.roleId, currentPath),
        },
        {
            id: 2,
            label: "Permissions",
            icon: "",
            iconActive: <></>,
            link: () => paths.private.club.rolePermissions(roleId, slug),
            isActive: (currentPath) =>
                isRouteActive(routes.club.private.config.rolePermissions, currentPath),
        },
        {
            id: 3,
            label: "Members",
            icon: "",
            iconActive: <></>,
            link: () => paths.private.club.roleMembers(roleId, slug),
            isActive: (currentPath) =>
                isRouteActive(routes.club.private.config.roleMembers, currentPath),
        }
    ];
