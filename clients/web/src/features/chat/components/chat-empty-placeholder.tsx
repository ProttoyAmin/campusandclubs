import { HugeiconsIcon } from "@hugeicons/react";
import { MessageAdd02Icon } from "@hugeicons/core-free-icons";
import { Button } from "design/components/ui/button";
import { useNavigate } from "react-router-dom";
import { routes } from "@/settings/routes";
const ChatEmptyPlaceholder = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center select-none">
            <div className="max-w-sm flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon icon={MessageAdd02Icon} className="size-8" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-2xl font-bold tracking-tight">Select a message</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Choose from your existing conversations, or start a new one.
                    </p>
                </div>
                <Button
                    size="lg"
                    className="rounded-full px-6 mt-2 font-medium"
                    onClick={() => navigate(routes.chat.new)}
                >
                    New message
                </Button>
            </div>
        </div>
    );
};
export default ChatEmptyPlaceholder;