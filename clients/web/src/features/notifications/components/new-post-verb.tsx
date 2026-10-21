import React from 'react'
import { type Notification } from '../http/notifications.http';

const NewPostVerb = ({ notification }: { notification: Notification }) => {
    return (
        <>
            {notification.verb}
        </>
    )
}

export default NewPostVerb