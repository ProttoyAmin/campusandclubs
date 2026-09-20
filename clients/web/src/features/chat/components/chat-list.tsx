import ChatBox from './chat-box'
import { type ChatResponse } from '../http/chat.http';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/settings/routes';

const ChatList = ({ chats }: { chats: ChatResponse[] }) => {
    const navigate = useNavigate();
    return (
        <div className='flex flex-col'>
            {chats?.map((chat: ChatResponse) => (
                <div key={chat.id} className="cursor-pointer" onClick={() => {
                    navigate(paths.private.chat.inbox(chat.id))
                }}>
                    <ChatBox chat={chat} />
                </div>
            ))}
        </div>
    )
}

export default ChatList