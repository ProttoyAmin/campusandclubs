import React from 'react'
import { type Notification } from '../http/notifications.http';

const FollowAcceptVerb = ({ notification }: { notification: Notification }) => {
    return (
        <>
            {notification.description}
        </>
    )
}

export default FollowAcceptVerb