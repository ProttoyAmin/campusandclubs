import { paths, routes } from "@/settings/routes";
import { House } from "lucide-react";
import type { MenuItemType } from "../menu/main-menu";
import { isRouteActive } from "@/utils/route";
import { HugeiconsIcon } from "@hugeicons/react";
import { SquareLock01Icon, ThreeDScaleIcon, UserRoundPenIcon } from "@hugeicons/core-free-icons";

export const SettingsMenu: () => MenuItemType[] = () => [
  {
    id: 1,
    label: "Accounts",
    icon: <HugeiconsIcon icon={UserRoundPenIcon} size={18} />,
    iconActive: <HugeiconsIcon icon={UserRoundPenIcon} size={18} />,
    link: () => paths.private.settings.account.base,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.account.base, currentPath),
  },
  {
    id: 2,
    label: "Privacy",
    icon: <HugeiconsIcon icon={SquareLock01Icon} size={18} />,
    iconActive: (
      <HugeiconsIcon icon={SquareLock01Icon} size={18} />
    ),
    link: () => paths.private.settings.privacy,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.privacy, currentPath),
  },
  {
    id: 3,
    label: "Affiliations",
    icon: <HugeiconsIcon icon={ThreeDScaleIcon} size={18} />,
    iconActive: (
      <HugeiconsIcon icon={ThreeDScaleIcon} size={18} />
    ),
    link: () => paths.private.settings.affiliations,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.affiliations, currentPath),
  },
];

export const SettingsDropdownMenu: () => MenuItemType[] = () => [
  {
    id: 1,
    label: "Settings",
    icon: <House size={18} />,
    iconActive: <House size={18} fill="currentColor" stroke="currentColor" />,
    link: () => routes.settings.account.base,
    isActive: (currentPath) =>
      isRouteActive(routes.settings.account.base, currentPath),
  },
];
