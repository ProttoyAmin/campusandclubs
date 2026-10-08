import { paths, routes } from "@/settings/routes";
import type { MenuItemType } from "../main-menu";
import { isRouteActive } from "@/utils/route";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockKeyholeIcon, ThreeDScaleIcon } from "@hugeicons/core-free-icons";

export const clubSettingsMenu: (slug: string) => MenuItemType[] = (
    slug: string,
) => [
        {
            id: 1,
            label: "Privacy",
            icon: <HugeiconsIcon icon={LockKeyholeIcon} />,
            iconActive: <HugeiconsIcon icon={LockKeyholeIcon} />,
            link: () => paths.private.club.settings.privacy(slug),
            isActive: (currentPath) =>
                isRouteActive(routes.club.private.config.settings.privacy, currentPath),
        },
        {
            id: 2,
            label: "Scope",
            icon: <HugeiconsIcon icon={ThreeDScaleIcon} size={18} />,
            iconActive: <HugeiconsIcon icon={ThreeDScaleIcon} size={18} />,
            link: () => paths.private.club.settings.scope(slug),
            isActive: (currentPath) =>
                isRouteActive(routes.club.private.config.settings.scope, currentPath),
        }
    ];
