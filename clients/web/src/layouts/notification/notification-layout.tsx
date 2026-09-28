import { Outlet } from "react-router-dom";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Card } from "design/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown, SettingsIcon } from "@hugeicons/core-free-icons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { paths, routes } from "@/settings/routes";


const NotificationLayout = () => {
    const pageHeader = usePageHeader()
    const navigate = useNavigate()

    return (
        <>
            <section className="flex flex-col gap-4 max-w-3xl justify-around mx-auto">
                <div className="">
                    {pageHeader.actions ?? <>
                        <div className="flex items-center">
                            <div className="">
                                <h1 className="text-2xl font-bold">
                                    Notifications
                                </h1>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger render={
                                    <button className="hover:bg-muted-foreground/5 transition-all duration-300 rounded-full p-2">
                                        <HugeiconsIcon icon={ArrowDown} size={20} />
                                    </button>
                                }>

                                </DropdownMenuTrigger>
                                <DropdownMenuGroup>
                                    <DropdownMenuContent align="center">
                                        <DropdownMenuItem onClick={() => navigate(paths.private.notification.base)}>All</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate(paths.private.notification.requests.base)}>Requests</DropdownMenuItem>
                                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenuGroup>
                            </DropdownMenu>
                        </div>
                    </>}
                </div>
                <Card className="w-full border-none rounded-none md:border md:rounded-xl bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] scrollbar-none p-0 shadow-2xl shadow-muted">
                    <Outlet />
                </Card>
            </section>
        </>
    )
}

export default NotificationLayout