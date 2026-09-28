import React from 'react';
import { useNotifications } from '../hooks/notifications.hooks';
import NotificationCard from '../components/notification-card';

const NotificationsPage = () => {
    const { getNotifications } = useNotifications();
    const notificationsData = getNotifications.data?.results

    return (
        <>
            {getNotifications.isLoading ? (
                <div className="flex items-center justify-center">Loading...</div>
            ) : getNotifications.isError ? (
                <div className="flex items-center justify-center">Error</div>
            ) : (
                notificationsData?.map(notification => (
                    <div key={notification.id} className='grid grid-rows-[auto] gap-2 p-4'>
                        <NotificationCard notification={notification} />
                    </div>
                ))
            )}
        </>
    )
}

export default NotificationsPage