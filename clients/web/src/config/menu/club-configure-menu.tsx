import { paths, routes } from "@/settings/routes";
import { InfoIcon, Settings2Icon, Users2Icon, ShieldCheckIcon, FilesIcon } from "lucide-react";
import type { MenuItemType } from "./main-menu";
import { isRouteActive } from "@/utils/route";
import { FolderUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const clubConfigureMenu: (slug: string) => MenuItemType[] = (
  slug: string,
) => [
    {
      id: 1,
      label: "Info",
      icon: <InfoIcon size={18} />,
      iconActive: <InfoIcon size={18} fill="currentColor" stroke="currentColor" />,
      link: () => paths.private.club.config(slug),
      isActive: (currentPath) =>
        isRouteActive(routes.club.private.config.base, currentPath),
    },
    {
      id: 2,
      label: "Roles & Permissions",
      icon: <ShieldCheckIcon size={18} />,
      iconActive: (
        <ShieldCheckIcon size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.club.permissions(slug),
      isActive: (currentPath) =>
        isRouteActive(routes.club.private.config.permissions, currentPath),
    },
    {
      id: 3,
      label: "Submissions",
      icon: <HugeiconsIcon icon={FolderUploadIcon} size={18} />,
      iconActive: (
        <HugeiconsIcon icon={FolderUploadIcon} size={18} />
      ),
      link: () => paths.private.club.submissions(slug),
      isActive: (currentPath) =>
        isRouteActive(routes.club.private.config.submissions, currentPath),
    },
    // {
    //   id: 4,
    //   label: "Requests",
    //   icon: <FilesIcon size={18} />,
    //   iconActive: (
    //     <FilesIcon size={18} fill="currentColor" stroke="currentColor" />
    //   ),
    //   link: () => paths.private.club.requests.base(slug),
    //   isActive: (currentPath) =>
    //     isRouteActive(routes.club.private.config.requests.base, currentPath),
    // },
    {
      id: 5,
      label: "Members",
      icon: <Users2Icon size={18} />,
      iconActive: (
        <Users2Icon size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.club.members(slug),
      isActive: (currentPath) =>
        isRouteActive(routes.club.private.config.members, currentPath),
    },
    {
      id: 6,
      label: "Settings",
      icon: <Settings2Icon size={18} />,
      iconActive: (
        <Settings2Icon size={18} fill="currentColor" stroke="currentColor" />
      ),
      link: () => paths.private.club.settings(slug),
      isActive: (currentPath) =>
        isRouteActive(routes.club.private.config.settings, currentPath),
    },
  ];
