import { MessageAdd02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react";
import EmptyState from "@/shared/components/empty-state";
import { Button } from "design/components/ui/button";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";

const Chats = () => {
    const navigate = useNavigate()
    return (
        <EmptyState
            icon={<HugeiconsIcon icon={MessageAdd02Icon} size={80} className="text-muted-foreground" />}
            title="Start conversation"
            description="Choose from your existing conversations, or start a new one."
        >
            <Button variant="default" className="rounded-full w-fit"
                onClick={() => navigate(paths.private.chat.new)}
            >New Message</Button>
        </EmptyState>
    )
}

export default Chats