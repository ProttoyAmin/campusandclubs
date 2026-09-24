import { useSectionId } from '@/shared/hooks/id';
import { Outlet, useLocation, useMatch, useNavigate, Navigate } from 'react-router-dom';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import { HugeiconsIcon } from '@hugeicons/react';
import { MessageAdd02Icon } from '@hugeicons/core-free-icons';
import { Button } from 'design/components/ui/button';
import { paths, routes } from '@/settings/routes';
import { useChats } from '@/features/chat/hooks/chat.hooks';
import ChatList from '@/features/chat/components/chat-list';
import EmptyState from '@/shared/components/empty-state';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import type { UserMinimal } from '@campus/api';
import { useParams } from 'react-router-dom';
import { Spinner } from 'design/components/ui/spinner';
import BottomBar from '@/components/bottom-bar';

const ChatsLayout = () => {
    const location = useLocation();
    const initialUser = (location.state as { initialUser?: UserMinimal } | null)?.initialUser;
    const { chats } = useChats();
    const navigate = useNavigate();
    const pageHeader = usePageHeader();
    const sectionId = useSectionId("section-layout", 20);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const chatDetailMatch = useMatch(routes.chat.inbox);
    const newChatMatch = useMatch(routes.chat.new);
    const params = useParams()


    if (initialUser && !newChatMatch && !chatDetailMatch) {
        if (chats.isLoading) {
            return <Spinner />;
        }

        const existingChat = chats.data?.data.find((chat) =>
            chat.participants.some((p) => p.user.id === initialUser.id) && chat.type === "DIRECT"
        );

        if (existingChat) {
            return <Navigate to={paths.private.chat.inbox(existingChat.id)} replace />;
        }

        return <Navigate to={paths.private.chat.new} replace state={{ initialUser }} />;
    }

    const showMobileList = !chatDetailMatch && !newChatMatch;

    const chatList = (
        <>
            <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold">
                    Chats
                </h2>

                <Button
                    size="icon-lg"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => navigate(routes.chat.new)}
                >
                    <HugeiconsIcon
                        icon={MessageAdd02Icon}
                        className="size-5"
                    />
                </Button>
            </div>

            <div className="mt-4">
                {/* <pre>{JSON.stringify(chatsData.data, null, 2)}</pre> */}
                {chats.data?.data?.length > 0 ? (
                    <ChatList chats={chats.data?.data} />
                ) : (
                    <EmptyState
                        title=""
                        description="No messages yet"
                    />
                )}
            </div>
        </>
    );

    if (isMobile) {
        return (
            <section
                id={sectionId}
                className="min-h-[calc(100vh-1rem)] h-full overflow-hidden"
            >
                {showMobileList ? (
                    <div className="min-h-[calc(100vh-4rem)]">
                        {chatList}
                    </div>
                ) : (
                    <div className="min-h-[calc(100vh-4rem)] h-full">
                        <div className="flex flex-col h-[calc(100vh-1rem)]">
                            {pageHeader.actions}
                            <Outlet context={{ chats: chats.data?.data ?? [] }} />
                        </div>
                    </div>
                )}
                {!chatDetailMatch && (
                    <div className="fixed bottom-0 w-full z-50 h-12 w-full bg-background">
                        <BottomBar />
                    </div>
                )}
            </section>
        );
    }

    return (
        <section
            id={sectionId}
            className="grid min-h-[calc(100vh-1rem)] grid-cols-12 overflow-hidden"
        >
            <div className="col-span-3 min-h-[calc(100vh-4rem)] border-r border-l">
                {chatList}
            </div>

            <div className="col-span-9 overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)]">
                <div className="flex flex-col h-full overflow-hidden">
                    {pageHeader.actions ?? <>chats</>}
                    <Outlet context={{ chats: chats.data?.data ?? [] }} />
                </div>
            </div>
        </section>
    );
};

export default ChatsLayout