import React from 'react'
import { Outlet } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useChat } from '@/features/chat/hooks/chat.hooks';
import ChatLayoutHeader from '@/features/chat/components/layout/layout-header';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import { useSession } from '@/features/auth/hooks';

const ChatLayout = () => {
    const { id } = useParams()
    const { chatDetail } = useChat(id!)
    const { data: session } = useSession()
    const pageHeader = usePageHeader()

    const currentUserId = session?.data?.user?.id

    React.useEffect(() => {
        const id = pageHeader.push(
            <ChatLayoutHeader chat={chatDetail.data?.data} currentUserId={currentUserId} />
        );
        return () => pageHeader.pop(id)
    }, [id, chatDetail.data])

    return (
        <div className='h-full'>
            <Outlet context={{ chat: chatDetail.data?.data }} />
        </div>
    )
}

export default ChatLayout