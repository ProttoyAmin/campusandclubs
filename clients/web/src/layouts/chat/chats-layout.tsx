import { useSectionId } from '@/shared/hooks/id';
import { Outlet, useLocation, useMatch, Navigate } from 'react-router-dom';
import { paths, routes } from '@/settings/routes';
import { useChats } from '@/features/chat/hooks/chat.hooks';
import Chats from '@/features/chat/pages/chats';
import ChatRequests from '@/features/chat/pages/chat-requests';
import type { UserMinimal } from '@campus/api';
import { Spinner } from 'design/components/ui/spinner';
import BottomBar from '@/components/bottom-bar';
import { useSocketEvent } from '@/shared/hooks/use-socket-event';
import { queryClient } from '@/config/query-client';

const ChatsLayout = () => {
    // All hooks declared unconditionally at the very top
    const location = useLocation();
    const sectionId = useSectionId("section-layout", 20);
    const { chats } = useChats();
    const chatDetailMatch = useMatch(routes.chat.inbox);
    const chatInfoMatch = useMatch(routes.chat.info);

    const initialUser = (location.state as { initialUser?: UserMinimal } | null)?.initialUser;

    const isRequests = location.pathname.startsWith('/@/chats/requests');
    const isNewChat = location.pathname.startsWith('/@/chats/new');
    const isConversationActive = Boolean(chatDetailMatch || chatInfoMatch);
    const isRightPaneActive = Boolean(isConversationActive || isNewChat);

    const chatsData = chats.data?.data ?? [];
    const isLoading = chats.isLoading;

    useSocketEvent("chat:message", () => {
        queryClient.invalidateQueries({
            queryKey: ["chats"],
        });
    });

    if (initialUser && !isNewChat && !isConversationActive) {
        if (isLoading) {
            return (
                <div className="flex h-screen items-center justify-center">
                    <Spinner />
                </div>
            );
        }

        const existingChat = chatsData.find((chat) =>
            chat.participants.some((p) => p.user.id === initialUser.id) && chat.type === "DIRECT"
        );

        if (existingChat) {
            return <Navigate to={paths.private.chat.inbox(existingChat.id)} replace />;
        }

        return <Navigate to={paths.private.chat.new} replace state={{ initialUser }} />;
    }

    return (
        <section
            id={sectionId}
            className="flex h-[calc(100vh-1rem)] w-full overflow-hidden bg-background"
        >
            {/* Left Column (Chat list on root/new/inbox, or Message Requests when on /requests) */}
            <div
                className={`
                    w-full md:w-90 lg:w-100 xl:w-105 shrink-0 md:border-r border-border h-full flex flex-col overflow-hidden
                    ${isRightPaneActive ? 'hidden md:flex' : 'flex'}
                `}
            >
                {isRequests ? (
                    <ChatRequests />
                ) : (
                    <Chats chats={chatsData} isLoading={isLoading} />
                )}
            </div>

            {/* Right Column (New chat / Conversation inbox / Empty placeholder) */}
            <div
                className={`
                    flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-background
                    ${isRightPaneActive ? 'flex' : 'hidden md:flex'}
                `}
            >
                <Outlet context={{ chats: chatsData, isLoading }} />
            </div>

            {/* Mobile Bottom Bar (only shown on root list when no conversation or new chat is open) */}
            {!isRightPaneActive && !isRequests && (
                <div className="md:hidden fixed bottom-0 w-full z-50 h-10 bg-background">
                    <BottomBar />
                </div>
            )}
        </section>
    );
};

export default ChatsLayout;