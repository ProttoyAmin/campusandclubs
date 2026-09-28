import React from 'react'
import { type Notification } from '../http/notifications.http';

const CommentedVerb = ({ notification }: { notification: Notification }) => {
    return (
        <>
            {notification.description}
        </>
    )
}

export default CommentedVerb