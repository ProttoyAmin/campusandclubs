import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";
import { Button } from "design/components/ui/button";
import EmptyState from "@/shared/components/empty-state";
import { useChats } from "../hooks/chat.hooks";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import { queryClient } from "@/config/query-client";
import { chatKeys } from "../hooks/chat.hooks";
import { Spinner } from "design/components/ui/spinner";
import { chat } from "../services/chat.service";

const ChatRequests = () => {
  const { pendingChats } = useChats();
  const navigate = useNavigate();

  if (pendingChats.isLoading) return <Spinner className="mx-auto mt-20" />;

  const list = pendingChats.data ?? [];

  if (list.length === 0) {
    return (
      <EmptyState
        title="No requests"
        description="When someone messages you for the first time, it'll show up here."
      />
    );
  }

  const accept = async (requestId: string, chatId: string | null) => {
    await chat.accept(requestId);
    queryClient.invalidateQueries({ queryKey: chatKeys.requests() });
    queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    if (chatId) navigate(paths.private.chat.inbox(chatId));
  };

  const decline = async (requestId: string) => {
    await chat.decline(requestId);
    queryClient.invalidateQueries({ queryKey: chatKeys.requests() });
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <h2 className="text-lg font-semibold px-2">Message Requests</h2>
      {list.map((r) => (
        <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
          <Avatar>
            <AvatarImage src={r.from_user.avatar ?? undefined} />
            <AvatarFallback>{r.from_user.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{r.from_user.username}</p>
            <p className="text-xs text-muted-foreground truncate">
              {r.content || "Wants to chat with you."}
            </p>
          </div>
          <Button
            size="sm"
            variant="default"
            className="rounded-full"
            onClick={() => accept(r.id, r.chat_id)}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={() => decline(r.id)}
          >
            Decline
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ChatRequests;
