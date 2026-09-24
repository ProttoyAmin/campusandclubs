import React from 'react';
import NavigateButtons from '@/shared/components/navigate-buttons';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';
import type { ChatResponse } from '../../http/chat.http';
import { paths } from '@/settings/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { EllipsisIcon } from '@hugeicons/core-free-icons';
import { Button } from 'design/components/ui/button';
import { useNavigate } from 'react-router-dom';

type ChatLayoutHeaderProps = {
    chat: ChatResponse;
    currentUserId: string
}

const ChatLayoutHeader = ({ chat, currentUserId }: ChatLayoutHeaderProps) => {
    const navigate = useNavigate();
    const participants = chat?.participants?.filter((p) => p.user.id !== currentUserId)


    const getChatLabel = () => {
        if (chat?.type === "GROUP") return chat.name as string
        return participants?.[0]?.user.username as string
    }

    const getAvatarSource = () => {
        if (chat?.type === "GROUP") return undefined
        return participants?.[0]?.user.avatar ?? undefined
    }

    const getAvatarAlt = () => {
        if (chat?.type === "GROUP") return undefined

        return `${participants?.[0]?.user.username ?? 'chat'}-media`
    }

    const getAvatarFallBack = () => {
        if (chat?.type === "GROUP") return chat.name[0].toUpperCase()

        return `${participants?.[0]?.user.username[0].toUpperCase() ?? undefined}`
    }

    return (
        <div className='flex items-center gap-2 w-full py-2'>
            <NavigateButtons hideForward />
            <Avatar
                size="lg"
            >
                <AvatarImage src={getAvatarSource()} alt={getAvatarAlt()} />
                <AvatarFallback>{getAvatarFallBack()}</AvatarFallback>
                {participants?.[0]?.user.status === "online" && <AvatarBadge className="bg-green-600 dark:bg-green-800" />}
            </Avatar>
            <p className="text-sm font-semibold">{getChatLabel()}</p>
            <Button
                variant={"glass"}
                size={"icon-lg"}
                className={"absolute right-2 rounded-full"}
            >
                <HugeiconsIcon icon={EllipsisIcon} className='size-6' />
            </Button>
        </div>
    )
}

export default ChatLayoutHeader