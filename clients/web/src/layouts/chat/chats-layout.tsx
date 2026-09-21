import { useEffect } from "react";
import { useSectionId } from "@/shared/hooks/id";
import { Outlet, useLocation, useMatch, useNavigate, Navigate, useParams } from "react-router-dom";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, MessageAdd02Icon } from "@hugeicons/core-free-icons";
import { Button } from "design/components/ui/button";
import { paths, routes } from "@/settings/routes";
import { useChats } from "@/features/chat/hooks/chat.hooks";
import ChatList from "@/features/chat/components/chat-list";
import EmptyState from "@/shared/components/empty-state";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import type { UserMinimal } from "@campus/api";
import { Spinner } from "design/components/ui/spinner";
import { useSession } from "@/features/auth/hooks";
import { ChatSocketProvider } from "@/features/chat/context/chat-socket-context";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";

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
  const requestsMatch = useMatch(routes.chat.requests);
  const params = useParams();
  const { data: session } = useSession();
  const currentUserId = session?.data?.user?.id;

  if (initialUser && !newChatMatch && !chatDetailMatch && !requestsMatch) {
    if (chatsData.isLoading) return <Spinner />;
    const existingChat = chatsData.data?.find(
      (chat) => chat.participants.some((user) => user.id === initialUser.id) && chat.type === "DIRECT",
    );
    if (existingChat) {
      return <Navigate to={paths.private.chat.inbox(existingChat.id)} replace />;
    }
    return <Navigate to={paths.private.chat.new} replace state={{ initialUser }} />;
  }

  const showMobileList = !chatDetailMatch && !newChatMatch && !requestsMatch;
  const chats = chatsData.data ?? [];

  const chatList = (
    <>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button
          size="icon-lg"
          variant="outline"
          className="rounded-full"
          onClick={() => navigate(routes.chat.new)}
          aria-label="New message"
        >
          <HugeiconsIcon icon={MessageAdd02Icon} className="size-5" />
        </Button>
      </div>
      <div className="px-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground rounded-full mb-2"
          onClick={() => navigate(paths.private.chat.requests)}
        >
          Message requests
        </Button>
      </div>
      <div>
        {chats.length > 0 ? (
          <ChatList chats={chats} activeId={params.id} currentUserId={currentUserId} />
        ) : (
          <EmptyState title="" description="No messages yet" />
        )}
      </div>
    </>
  );

  const title = () => {
    if (chatDetailMatch && params.id) {
      const chat = chats.find((c) => c.id === params.id);
      const other = chat?.participants.find((p) => p.id !== currentUserId);
      const name =
        chat?.type === "DIRECT"
          ? other?.username ?? "Chat"
          : chat?.name ?? "Chat";
      return (
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full -ml-2"
              onClick={() => navigate(paths.private.chat.chats)}
              aria-label="Back"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{name}</h1>
        </div>
      );
    }
    if (requestsMatch) return <h1 className="text-lg font-semibold">Message requests</h1>;
    if (newChatMatch) return <h1 className="text-lg font-semibold">New Chat</h1>;
    return <h1 className="text-lg font-semibold">Chats</h1>;
  };

  useEffect(() => {
    const id = pageHeader.push(title());
    return () => pageHeader.pop(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, chatDetailMatch, newChatMatch, requestsMatch, chats.length, isMobile]);

  if (isMobile) {
    return (
      <section id={sectionId} className="min-h-[calc(100vh-1rem)] h-full overflow-hidden">
        <ChatSocketProvider>
          {showMobileList ? (
            <div className="min-h-[calc(100vh-4rem)]">{chatList}</div>
          ) : (
            <div className="min-h-[calc(100vh-4rem)] h-full">
              <div className="flex flex-col gap-4 h-[calc(100vh-4rem)]">
                <Outlet context={{ chats, isLoading: chatsData.isLoading }} />
              </div>
            </div>
          )}
        </ChatSocketProvider>
      </section>
    );
  }

  return (
    <section id={sectionId} className="grid min-h-[calc(100vh-1rem)] grid-cols-12 overflow-hidden">
      <div className="col-span-3 min-h-[calc(100vh-4rem)] border-r border-l">{chatList}</div>
      <div className="col-span-9 overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-4rem)] max-h-[calc(100vh-1rem)] p-0">
        <ChatSocketProvider>
          <div className="flex flex-col gap-0 h-full overflow-hidden">
            <Outlet context={{ chats, isLoading: chatsData.isLoading }} />
          </div>
        </ChatSocketProvider>
      </div>
    </section>
  );
};

export default ChatsLayout;
