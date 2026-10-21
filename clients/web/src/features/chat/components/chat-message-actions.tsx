import { useState } from "react";
import { Button } from "design/components/ui/button";
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "design/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    MoreVerticalIcon,
    ReplyIcon,
    SmileIcon,
} from "@hugeicons/core-free-icons";
import ResponsiveDropDownMenu from "@/shared/components/responsive-dropdown-menu";
import type { Message as MessageT } from "../http/chat.http";
import { cn } from "design/lib/utils";
import { toast } from "design/components/ui/toast";
import { useChatContext } from "../context/use-chat-context";

export interface ChatMessageActionsProps {
    message: MessageT;
    isOwn?: boolean;
    className?: string;
}

const ChatMessageActions = ({
    message,
    isOwn = false,
    className,
}: ChatMessageActionsProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { setReplying } = useChatContext();

    const onCopyContent = () => {
        navigator.clipboard.writeText(message.content);
        toast.add({
            title: "Copied",
            description:
                message.content.slice(0, 50) +
                (message.content.length > 50 ? "..." : ""),
        });
        setMenuOpen(false);
    };

    return (
        <div
            data-slot="chat-message-actions"
            className={cn(
                "flex items-center gap-1 transition-opacity duration-150 shrink-0",
                menuOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:group-hover/message-row:opacity-100 md:group-hover/message-row:pointer-events-auto md:group-focus-within/message-row:opacity-100 md:group-focus-within/message-row:pointer-events-auto",
                className,
                isOwn ? "flex-row-reverse" : "",
            )}
        >
            {/* Reaction triggers / picker can be added here */}
            <Button
                size="icon-xs"
                className={
                    "rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                }
                variant={"ghost"}
            >
                <HugeiconsIcon icon={SmileIcon} className="size-4" />
            </Button>

            <Button
                size="icon-xs"
                className={
                    "rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                }
                variant={"ghost"}
                onClick={() => setReplying({
                    id: message.id,
                    content: message.content,
                    sender: message.sender,
                })}
            >
                <HugeiconsIcon icon={ReplyIcon} className="size-4" />
            </Button>

            <ResponsiveDropDownMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                        }}
                    >
                        <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                    </Button>
                }
            >
                <DropdownMenuGroup>
                    <DropdownMenuLabel
                        className="p-3 md:p-2 text-xs text-muted-foreground"
                    >
                        {new Date(message.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) + " | " + new Date(message.created_at).toLocaleTimeString()}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="p-3 md:p-2 cursor-pointer"
                        onClick={onCopyContent}
                    >
                        Copy text
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="p-3 md:p-2 cursor-pointer"
                        onClick={() => {
                            setMenuOpen(false);
                        }}
                    >
                        Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="p-3 md:p-2 cursor-pointer"
                        onClick={() => {
                            setMenuOpen(false);
                        }}
                    >
                        Save
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="p-3 md:p-2 cursor-pointer"
                        onClick={() => {
                            setMenuOpen(false);
                        }}
                    >
                        Not interested
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </ResponsiveDropDownMenu>
        </div>
    );
};

export default ChatMessageActions;
