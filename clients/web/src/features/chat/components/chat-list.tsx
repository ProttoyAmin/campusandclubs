import ChatBox from './chat-box'
import { type ChatResponse } from '../http/chat.http';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/settings/routes';
import { useSession } from '@/features/auth/hooks';

const ChatList = ({ chats }: { chats: ChatResponse[] }) => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const currentUserId = session?.data?.user?.id
    return (
        <div className='flex flex-col'>
            {chats?.map((chat: ChatResponse) => (
                <div key={chat.id} className="cursor-pointer" onClick={() => {
                    navigate(paths.private.chat.inbox(chat.id))
                }}>
                    <ChatBox chat={chat} currentUserId={currentUserId} />
                </div>
            ))}
        </div>
    )
}

export default ChatList