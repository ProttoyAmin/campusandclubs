import React from 'react';
import { type Notification } from '../http/notifications.http';
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';
import { getTimeAgo } from '@/utils/format-date';
import { Badge } from 'design/components/ui/badge';
import LikedVerb from './liked-verb';
import CommentedVerb from './commented-verb';
import NewPostVerb from './new-post-verb';
import FollowRequestVerb from './follow-request-verb';
import FollowAcceptVerb from './follow-accept-verb';

const NotificationCard = ({ notification }: { notification: Notification }) => {

    return (
        <div className='flex items-center gap-2'>
            {(() => {
                switch (notification.verb) {
                    case "like":
                        return <LikedVerb notification={notification} />

                    case "commented":
                        return <CommentedVerb notification={notification} />

                    case "new_post":
                        return <NewPostVerb notification={notification} />

                    case "follow_request":
                        return <FollowRequestVerb notification={notification} />

                    case "follow_accept":
                        return <FollowAcceptVerb notification={notification} />

                    default:
                        return null
                }
            })()}
        </div>
    )
}

export default NotificationCard