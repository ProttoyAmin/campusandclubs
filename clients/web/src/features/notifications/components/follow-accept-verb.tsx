import React from 'react'
import { type Notification } from '../http/notifications.http';
import { paths } from '@/settings/routes';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';
import { getTimeAgo } from '@/utils/format-date';

const FollowAcceptVerb = ({ notification }: { notification: Notification }) => {
    return (
        <div className='w-full flex items-start gap-3 hover:bg-muted p-3 rounded-lg'>
            <div className={'flex flex-col h-full justify-start'}>
                <Avatar size='lg' >
                    <AvatarImage src={notification.primary_actor?.avatar} />
                    <AvatarFallback>{notification.primary_actor?.username}</AvatarFallback>
                </Avatar>
            </div>

            <div className='flex flex-col gap-2.5'>
                <div className='flex flex-row gap-1'>
                    <Link to={`${paths.private.user.profile(notification.primary_actor?.username)}`}>
                        <span className='font-bold text-primary hover:underline cursor-pointer'>{notification.primary_actor?.username}</span>
                    </Link>
                    <span>{notification.description}</span>
                    <small className='text-xs text-muted-foreground'>{getTimeAgo(notification.created_at)}</small>
                </div>
            </div>
        </div>
    )
}

export default FollowAcceptVerb