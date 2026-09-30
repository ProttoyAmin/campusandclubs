import React from 'react';
import NavigateButtons from '@/shared/components/navigate-buttons';
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from 'design/components/ui/avatar';
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

const MAX_VISIBLE = 2;

const ChatLayoutHeader = ({ chat, currentUserId }: ChatLayoutHeaderProps) => {
    const navigate = useNavigate();
    const participants = chat?.participants?.filter((p) => p.user.id !== currentUserId)


    const getChatLabel = () => {
        if (chat?.type === "GROUP") return <>
            {chat?.name ? (
                chat.name
            ) : (
                <p className="font-semibold">{participants.map((u) => u?.user?.username).join(", ")}</p>
            )}
        </>
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
        if (chat?.type === "GROUP") return chat?.name?.[0]?.toUpperCase()

        return `${participants?.[0]?.user.username?.[0]?.toUpperCase() ?? undefined}`
    }

    return (
        <div className='flex items-center gap-2 w-full py-2'>
            <NavigateButtons hideForward />
            {chat?.type === "GROUP" ? (
                <>
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
                </>
            ) : (
                <>
                    <Avatar
                        size="lg"
                    >
                        <AvatarImage src={getAvatarSource()} alt={getAvatarAlt()} />
                        <AvatarFallback>{getAvatarFallBack()}</AvatarFallback>
                        {/* @ts-ignore: Ignore the type error for status */}
                        {participants?.[0]?.user.status === "online" && <AvatarBadge className="bg-green-600 dark:bg-green-800" />}
                    </Avatar>
                </>
            )}
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