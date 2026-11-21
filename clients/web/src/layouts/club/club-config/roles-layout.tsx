import { Outlet } from "react-router-dom";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useClubInfo } from "@/features/club/hooks/club.hooks";
import { DynamicMenu } from "@/config/menu/dynamic-menu";
import { routes } from "@/settings/routes";
import SideBar from "@/components/sidebar";
import NavTabs from "@/components/nav-tabs";
import { useIsMobile } from "design/hooks/use-mobile";

const RolesLayout = () => {
    const { club } = useClubOutlet();
    const isMobile = useIsMobile()
    const { getRoles } = useClubInfo(club.slug);
    const canAccess =
        club?.me_permissions?.includes("manage_roles") || club?.is_owner;
    const roleData = getRoles(club.id, canAccess);

    if (isMobile) {
        return (
            <>
            <Outlet context={{ club, roles: roleData.data?.roles || [] }} />
            </>
        )
    }

    return (
        <div className="flex gap-5">
            <div className="space-y-2 w-3xs">
                {roleData.data?.roles?.length > 0 ? (
                roleData.data?.roles?.map((role: any) => (
                    <SideBar
                        key={role?.id}
                        menu={() =>
                            DynamicMenu(
                                role?.id,
                                role?.name,
                                routes.club.private.config.roleId,
                                "",
                                club.slug,
                            )
                        }
                        menuParam={role?.id}
                    />
                ))
            ) : (
                <span className="text-muted-foreground text-xs text-center">
                    No roles joined yet.
                </span>
            )}
            </div>
            <Outlet context={{ club, roles: roleData.data?.roles || [] }} />
        </div>
    );
};

export default RolesLayout;
