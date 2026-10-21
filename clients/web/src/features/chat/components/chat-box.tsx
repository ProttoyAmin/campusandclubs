import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "design/components/ui/avatar"
import { type ChatResponse } from "../http/chat.http"
import { getTimeAgo } from "@/utils/format-date";
import { useLocation } from "react-router-dom";


const MAX_VISIBLE = 3;

const ChatBox = ({ chat, currentUserId }: { chat: ChatResponse, currentUserId: string }) => {
    const location = useLocation()
    const participants = chat.participants.filter((p) => p.user.id !== currentUserId)

    const getChatLabel = () => {
        if (chat.type === "GROUP") return chat.name as string
        return participants[0]?.user.username as string
    }

    return (
        <div className={`relative flex gap-4 py-6 md:px-4 rounded-2xl cursor-pointer hover:border-primary transition-all ease-linear hover:bg-card-foreground/5 ${location.pathname.includes(chat.id) && 'bg-card-foreground/7'}`}>
            {chat?.type === "GROUP" ? (
                <AvatarGroup>
                    {participants.slice(0, MAX_VISIBLE).map((p) => (
                        <Avatar key={p.user.id} size="xl">
                            <AvatarImage src={p.user.avatar ?? undefined} />
                            <AvatarFallback>{p.user.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                    ))}
                    {participants.length > MAX_VISIBLE && (
                        <AvatarGroupCount>+{participants.length - MAX_VISIBLE}</AvatarGroupCount>
                    )}
                </AvatarGroup>
            ) : (
                <Avatar size="xl">
                    <AvatarImage src={participants[0]?.user.avatar ?? undefined} />
                    <AvatarFallback>{participants[0]?.user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div className='flex-1'>
                <div className='flex items-center justify-between'>
                    <p className='text-base'>{getChatLabel()}</p>
                    <p className='text-xs text-muted-foreground'>{getTimeAgo(chat?.last_message?.created_at)}</p>
                </div>
                {/* <h3 className='text-sm font-semibold'>{chat?.id}</h3> */}
                <h3 className={`text-sm ${chat.last_message?.has_user_seen ? "text-muted-foreground" : ""} max-w-50 truncate`}>
                    <span className="font-semibold">{chat.last_message?.sender.id === currentUserId ? 'You: ' : ""}</span>
                    {chat.last_message?.content.slice(0, 50) + (chat.last_message?.content.length > 50 ? "..." : "")}
                </h3>
            </div>
            {!chat.last_message?.has_user_seen && (
                <div className='absolute top-3/5 right-3 md:right-6 translate-y-[-50%] bg-blue-600 rounded-full w-2 h-2 flex items-center justify-center'>
                </div>
            )}
        </div>
    )
}

export default ChatBox