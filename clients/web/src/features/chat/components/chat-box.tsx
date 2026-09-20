import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "design/components/ui/avatar"
import { type ChatResponse } from "../http/chat.http"
import { getTimeAgo } from "@/utils/format-date"

const ChatBox = ({ chat }: { chat: ChatResponse }) => {
    return (
        <div className='flex items-center gap-4 py-6 px-2 cursor-pointer hover:border-primary transition-all ease-linear hover:bg-card-foreground/5'>
            {/* {chat.participants?.map(participant => (
                <> */}
            {chat?.type === "GROUP" ? (
                <AvatarGroup>
                    <Avatar className="" key={chat.participants[0].id}>
                        <AvatarImage
                            src={chat.participants[0].avatar ?? undefined}
                            alt={`${chat.participants[0].username}`}
                        />
                        <AvatarFallback className="text-primary text-sm">
                            {chat.participants[0].username && chat.participants[0].username.length > 0
                                ? `${chat.participants[0].username.charAt(0).toUpperCase()}`
                                : "U"}
                        </AvatarFallback>
                    </Avatar>
                    <Avatar className="" key={chat.participants[1]?.id}>
                        <AvatarImage
                            src={chat.participants[1]?.avatar ?? undefined}
                            alt={`${chat.participants[1]?.username}`}
                        />
                        <AvatarFallback className="text-primary text-sm">
                            {chat.participants[1]?.username && chat.participants[1]?.username.length > 0
                                ? `${chat.participants[1]?.username.charAt(0)}`
                                : "U"}
                        </AvatarFallback>
                    </Avatar>
                    <AvatarGroupCount>+{chat.participants.length - 2}</AvatarGroupCount>
                </AvatarGroup>
            ) : (
                <Avatar className="" key={chat.participants[0]?.id} size="lg">
                    <AvatarImage
                        src={chat.participants[0]?.avatar ?? undefined}
                        alt={`${chat.participants[0]?.username}`}
                    />
                    <AvatarFallback className="text-primary text-sm">
                        {chat.participants[0]?.username && chat.participants[0]?.username.length > 0
                            ? `${chat.participants[0]?.username.charAt(0).toUpperCase()}`
                            : "U"}
                    </AvatarFallback>
                </Avatar>
            )}
            {/* </>
            ))} */}
            <div className='flex-1'>
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