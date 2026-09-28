import React from 'react'
import { type Notification } from '../http/notifications.http';

const FollowRequestVerb = ({ notification }: { notification: Notification }) => {
    return (
        <>
            {notification.description}
        </>
    )
}

export default FollowRequestVerb