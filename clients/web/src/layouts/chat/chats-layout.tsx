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
import { ChatSocketProvider } from "@/features/chat/context/chat-socket-context";

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
    const params = useParams();
    const chatItems = chats.data ?? [];

    if (initialUser && !newChatMatch && !chatDetailMatch) {
        if (chats.isLoading) {
            return <Spinner />;
        }

        const existingChat = chatItems.find((chat) =>
            chat.participants.some((participant) => participant.user.id === initialUser.id) && chat.type === "DIRECT"
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
                {chatItems.length > 0 ? (
                    <ChatList chats={chatItems} />
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
            <ChatSocketProvider>
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
                            <div className="flex flex-col gap-4 h-[calc(100vh-4rem)]">
                                {pageHeader.actions ?? <>
                                    {params.id ? (
                                        <>{params.id}</>
                                    ) : (
                                        <>chats</>
                                    )}

                                </>}
                                <Outlet context={{ chats: chatItems }} />
                            </div>
                        </div>
                    )}
                </section>
            </ChatSocketProvider>
        );
    }

    return (
        <ChatSocketProvider>
            <section
                id={sectionId}
                className="grid min-h-[calc(100vh-1rem)] grid-cols-12 overflow-hidden"
            >
                <div className="col-span-3 min-h-[calc(100vh-4rem)] border-r border-l">
                    {chatList}
                </div>

                <div className="col-span-9 overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-4rem)] max-h-[calc(100vh-1rem)] p-0">
                    <div className="flex flex-col gap-4 h-full overflow-hidden">
                        {pageHeader.actions ?? <>chats</>}
                        <Outlet context={{ chats: chatItems }} />
                    </div>
                </div>
            </section>
        </ChatSocketProvider>
    );
};

export default ChatsLayout;
