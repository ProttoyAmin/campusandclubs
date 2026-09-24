import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "design/components/ui/avatar"
import { type ChatResponse } from "../http/chat.http"
import { getTimeAgo } from "@/utils/format-date";
import { useLocation } from "react-router-dom";


const MAX_VISIBLE = 3;

const ChatBox = ({ chat, currentUserId }: { chat: ChatResponse, currentUserId: string }) => {
    const location = useLocation()
    const participants = chat.participants.filter((p) => p.user.id !== currentUserId)
    console.log(participants);

    const getChatLabel = () => {
        if (chat.type === "GROUP") return chat.name as string
        return participants[0]?.user.username as string
    }

    return (
        <div className={`flex items-center gap-4 py-6 px-2 cursor-pointer hover:border-primary transition-all ease-linear hover:bg-card-foreground/5 ${location.pathname.includes(chat.id) && 'bg-card-foreground/7'}`}>
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
                <span>
                    {getChatLabel()}
                </span>
                {/* <h3 className='text-sm font-semibold'>{chat?.id}</h3> */}
                <h3 className='text-sm text-muted-foreground'>{chat.last_message?.content}</h3>
            </div>
            <div className='flex items-center gap-2'>
                <p className='text-xs text-muted-foreground'>{getTimeAgo(chat?.created_at)}</p>
            </div>
        </div>
    )
}

export default ChatBox