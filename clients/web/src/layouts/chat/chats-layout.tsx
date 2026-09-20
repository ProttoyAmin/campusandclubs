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
import { useEffect } from 'react';
import { Spinner } from 'design/components/ui/spinner';

const ChatsLayout = () => {
    const location = useLocation();
    const initialUser = (location.state as { initialUser?: UserMinimal } | null)?.initialUser;
    const { chats: chatsData } = useChats();
    const navigate = useNavigate();
    const pageHeader = usePageHeader();
    const sectionId = useSectionId("section-layout", 20);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const chatDetailMatch = useMatch(routes.chat.inbox);
    const newChatMatch = useMatch(routes.chat.new);

    if (initialUser && !newChatMatch && !chatDetailMatch) {
        if (chatsData.isLoading) {
            return <Spinner />;
        }

        const existingChat = chatsData.data?.data.find((chat) =>
            chat.participants.some((user) => user.id === initialUser.id) && chat.type === "DIRECT"
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
                {chatsData.data?.data?.length > 0 ? (
                    <ChatList chats={chatsData.data.data} />
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
                    <div className="min-h-[calc(100vh-4rem)] px-4 h-full">
                        <div className="flex flex-col gap-4 h-[calc(100vh-4rem)]">
                            {pageHeader.actions ?? <>chats</>}
                            <Outlet context={{ chats: chatsData.data?.data ?? [] }} />
                        </div>
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

            <div className="col-span-9 min-h-[calc(100vh-4rem)] px-4">
                <div className="flex flex-col gap-4 h-full overflow-hidden">
                    {pageHeader.actions ?? <>chats</>}
                    <Outlet context={{ chats: chatsData.data?.data ?? [] }} />
                </div>
            </div>
        </section>
    );
};

export default ChatsLayout