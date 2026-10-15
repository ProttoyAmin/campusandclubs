/**
 * ClubShellLayout
 *
 * Shared frame for everything under /@/clubs/:slug/* — both the public
 * club page (posts/media) and the owner config pages (info/members/
 * requests/settings). It owns:
 *   • the banner
 *   • the persistent header (avatar, name, join/settings, back button on mobile)
 *   • responsive container widths (full-width on mobile, max-w-3xl card on
 *     desktop; the app-level left SideBar already reserves space via
 *     md:ms-44)
 *
 * Child routes render through <Outlet /> and decide what goes below the
 * header (profile tabs on the public page, sidebar+content on config
 * pages, mobile menu pages, etc.).
 */
import { ClubApplicationDialog } from "@/features/club/components/club/club-apply-dialog";
import { ClubApplicationWithdrawDialog } from "@/features/club/components/club/club-withdraw-dialog";
import { useClub, useJoin } from "@/features/club/hooks/club.hooks";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { useSectionId } from "@/shared/hooks/id";
import { useScrollRestoration } from "@/shared/hooks/use-scroll-restoration";
import ClubLayoutHeader from "@/features/club/components/layout/layout-header";
import { Card } from "design/components/ui/card";
import { toast } from "design/components/ui/toast";
import React, { useRef } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import type { ClubDetailExtended } from "@/features/club/http/club.http";
import BottomBar from "@/components/bottom-bar";
import NavTabs from "@/components/nav-tabs";
import { clubProfileMenu } from "@/config/menu/club/club-menu";

const ClubShellLayout: React.FC = () => {
    const { slug } = useParams();
    const pageHeader = usePageHeader();
    const { data: club } = useClub(slug);
    const { mutate: joinClub, isPending: isJoinPending } = useJoin(club?.id, slug);
    const [joinDialogData, setJoinDialogData] = React.useState<{
        detail: string;
        application_url: string;
    } | null>(null);
    const [isWithdrawing, setIsWithdrawing] = React.useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    useScrollRestoration(scrollRef, location.key);

    const handleJoin = () => {
        if (club?.is_member) return;
        // @ts-ignore TODO: tighten application type
        if (club?.application && club?.application?.status === "pending") {
            setIsWithdrawing(true);
            return;
        }
        if (club?.join_mode === "application") {
            setJoinDialogData({ detail: "Join this club", application_url: "" });
            return;
        }
        if (club?.join_mode === "invite_only") {
            toast.add({
                title: "Club invite only",
                description: "You need to be invited to join this club",
                type: "info",
            });
            return;
        }
        joinClub(null, {
            onSuccess: () => {
                toast.add({ description: "Joined", type: "success" });
            },
            onError: (error) => {
                toast.add({ description: error.response?.data?.detail, type: "error" });
            },
        });
    };

    React.useEffect(() => {
        document.title = `${slug ? slug + " - Clubs" : "Clubs"}`;
    }, [slug]);

    return (
        <section
            id={useSectionId()}
            className="flex flex-col gap-4"
        >
            <div className="flex max-w-5xl self-center w-full xl:w-5xl justify-between items-center sticky top-0 z-50">
                {pageHeader.actions ?? (
                    <>
                        <ClubLayoutHeader
                            club={club}
                            slug={slug}
                            handleJoin={handleJoin}
                            isJoinPending={isJoinPending}
                        />
                        <ClubApplicationDialog
                            open={!!joinDialogData}
                            onOpenChange={(open) => !open && setJoinDialogData(null)}
                            title={`${club?.name}`}
                            clubId={club?.id}
                            club={club as Pick<ClubDetailExtended, "id" | "name" | "origin" | "scope" | "join_mode">}
                        />
                        <ClubApplicationWithdrawDialog
                            open={isWithdrawing}
                            onOpenChange={setIsWithdrawing}
                            title={`${club?.name}`}
                            description="Are you sure you want to withdraw your application?"
                            clubId={club?.id}
                            // @ts-ignore
                            applicationId={club?.application?.id}
                        />
                    </>
                )}
            </div>

            <div
                ref={scrollRef}
                className="min-w-full md:min-w-3xl border-none rounded-none md:border md:rounded-xl shadow-lg bg-background scrollbar-none p-0"
            // className="mx-auto min-w-full md:min-w-3xl grid grid-cols-[200px_1fr] gap-2.5"
            >
                {/* <div className='h-full'>
                    <NavTabs
                        menu={clubProfileMenu(slug)}
                        className="flex flex-row md:flex-col gap-2"
                    />
                </div> */}
                <div className="min-h-[calc(100vh-8rem)]">
                    <Outlet context={{ club }} />
                </div>
                {/* <div className="md:hidden fixed bottom-0 w-full z-50 h-12 bg-background">
                    <BottomBar />
                </div> */}
            </div>
        </section>
    );
};

export default ClubShellLayout;