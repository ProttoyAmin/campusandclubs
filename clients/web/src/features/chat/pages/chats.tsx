import { MessageAdd02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import EmptyState from "@/shared/components/empty-state";
import { Button } from "design/components/ui/button";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import ChatList from "../components/chat-list";
import useChatOutlet from "../context/use-chat-outlet";
import { Spinner } from "design/components/ui/spinner";
import { useSession } from "@/features/auth/hooks";

const Chats = () => {
  const navigate = useNavigate();
  const { chats, isLoading } = useChatOutlet();
  const { data: session } = useSession();
  const currentUserId = session?.data?.user?.id;

  if (isLoading) return <Spinner className="mx-auto mt-20" />;

  if (!chats || chats.length === 0) {
    return (
      <EmptyState
        icon={<HugeiconsIcon icon={MessageAdd02Icon} size={80} className="text-muted-foreground" />}
        title="Start conversation"
        description="Choose from your existing conversations, or start a new one."
      >
        <Button
          variant="default"
          className="rounded-full w-fit"
          onClick={() => navigate(paths.private.chat.new)}
        >
          New Message
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold">Recent</h2>
        <Button
          size="icon-lg"
          variant="outline"
          className="rounded-full"
          onClick={() => navigate(paths.private.chat.requests)}
        >
          Requests
        </Button>
      </div>
      <ChatList chats={chats} currentUserId={currentUserId} />
    </div>
  );
};

export default Chats;
