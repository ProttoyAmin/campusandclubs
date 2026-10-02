import { type Notification } from '../http/notifications.http';
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';
import { getTimeAgo } from '@/utils/format-date';
import { } from "@campus/api";
import type { PostExtended } from '@/features/posts/components/post-card';
import { Link } from 'react-router-dom';
import { paths } from '@/settings/routes';
import { Skeleton } from 'design/components/ui/skeleton';

export const NotificationCardSkeleton = () => {
    return (
        <div className='flex gap-3 px-6 py-2 mt-4'>
            <div className={'flex flex-col h-full justify-start'}>
                <Skeleton className='w-12 h-12 rounded-full' />
            </div>

            <div className='flex flex-col gap-2.5 w-1/2'>
                <div className='flex flex-row gap-1'>
                    <Skeleton className='w-32 h-4' />
                </div>
                <Skeleton className='h-12' />
            </div>
        </div>
    )
}

const LikedVerb = ({ notification }: { notification: Notification }) => {
    return (
        <Link to={notification.preview_url} className='w-full flex items-start gap-3 hover:bg-muted p-3 rounded-lg'>
            <div className={'flex flex-col h-full justify-start'}>
                <Avatar size='lg' >
                    <AvatarImage src={notification.primary_actor.avatar} />
                    <AvatarFallback>{notification.primary_actor.username}</AvatarFallback>
                </Avatar>
            </div>

            <div className='flex flex-col gap-2.5'>
                <div className='flex flex-row gap-1'>
                    <Link to={`${paths.private.user.profile(notification.primary_actor?.username)}`}>
                        <span className='font-bold text-primary hover:underline cursor-pointer'>{notification.primary_actor.username}</span>
                    </Link>
                    <span>{notification.description}</span>
                    <small className='text-xs text-muted-foreground'>{getTimeAgo(notification.created_at)}</small>
                </div>
                {notification.target_type === "Post" && (
                    <>
                        <div className="flex flex-col gap-2">
                            <p>{(notification.target_preview as PostExtended).content}</p>
                            {(notification.target_preview as PostExtended).media.length > 0 && (
                                <img src={(notification.target_preview as PostExtended).media[0]?.file?.url} alt="" className="h-30 w-30 object-cover" />
                            )}
                        </div>
                    </>
                )}
            </div>
        </Link>
    )
}

export default LikedVerb