import React from 'react'
import { type Notification } from '../http/notifications.http';
import { Button } from 'design/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';
import { paths } from '@/settings/routes';
import { Link } from 'react-router-dom';
import { getTimeAgo } from '@/utils/format-date';
import { useConnections } from '@/features/activities/hooks/activity.hook';
import { toast } from 'design/components/ui/toast';
import { Spinner } from 'design/components/ui/spinner';
import { AxiosError } from 'axios';
import type { APIError } from '@/shared/types/response';
import ToggleFollowButton from '@/features/user/components/actions/follow-button';

const FollowRequestVerb = ({ notification }: { notification: Notification }) => {
    const { acceptRequest, rejectRequest, toggleFollow } = useConnections()
    const accept = acceptRequest(notification.primary_actor?.id)
    const reject = rejectRequest(notification.primary_actor?.id)
    const follow = toggleFollow(notification.primary_actor?.id)

    const handleAccept = () => {
        accept.mutate(undefined, {
            onSuccess(data) {
                toast.add({
                    title: data?.data?.detail,
                    type: "success",
                    timeout: 5000,
                })
            },
            onError(error: AxiosError<APIError>) {
                toast.add({
                    title: error?.response?.data?.detail || "Something went wrong",
                    type: "destructive",
                    timeout: 5000,
                })
            },
        })
    }

    const handleReject = () => {
        reject.mutate(undefined, {
            onSuccess(data) {
                console.log(data)
            },
            onError(error) {
                console.log(error)
            },
        })
    }

    const handleFollow = () => {
        follow.mutate(undefined, {
            onSuccess(data) {
                toast.add({
                    title: data?.data?.detail,
                    type: "success",
                    timeout: 5000,
                })
            },
            onError(error: AxiosError<APIError>) {
                toast.add({
                    title: error?.response?.data?.detail || "Something went wrong",
                    type: "destructive",
                    timeout: 5000,
                })
            },
        })
    }

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


                {/* {!notification.primary_actor?.is_followed_by ? (
                            <>
                                <Button size="sm" onClick={handleAccept} disabled={accept.isPending}>
                                    {accept.isPending ? <Spinner /> : "Accept"}
                                </Button>
                                <Button size="sm" variant="secondary" onClick={handleReject} disabled={reject.isPending}>
                                    {reject.isPending ? <Spinner /> : "Decline"}
                                </Button>
                            </>
                        ) : !notification.primary_actor?.is_following ? (
                            <ToggleFollowButton userId={notification.primary_actor?.id} username={notification.primary_actor?.username} isFollowing={notification.primary_actor?.is_following} followStatus={notification.primary_actor?.follow_status} />
                        ) : (
                            <div className='flex flex-row gap-1'>
                                <p className='text-muted-foreground'>Accepted</p>
                            </div>
                        )} */}

                {notification.actor_count === 1 && (
                    <>
                        {notification.primary_actor.follow_status === "pending" ? (
                            <ToggleFollowButton userId={notification.primary_actor?.id} username={notification.primary_actor?.username} isFollowing={notification.primary_actor?.is_following} followStatus={notification.primary_actor?.follow_status} />
                        ) : notification.primary_actor?.is_followed_by ? (
                            <div className='flex flex-row gap-1'>
                                <p className='text-muted-foreground'>Accepted</p>
                            </div>
                        ) : (
                            <div className='flex flex-row gap-1'>
                                <Button size="sm" onClick={handleAccept} disabled={accept.isPending}>
                                    {accept.isPending ? <Spinner /> : "Accept"}
                                </Button>
                                <Button size="sm" variant="secondary" onClick={handleReject} disabled={reject.isPending}>
                                    {reject.isPending ? <Spinner /> : "Decline"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default FollowRequestVerb