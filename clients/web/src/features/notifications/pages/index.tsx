import React from 'react';
import { useNotifications } from '../hooks/notifications.hooks';
import NotificationCard from '../components/notification-card';
import { NotificationCardSkeleton } from '../components/liked-verb';

const NotificationsPage = () => {
    const { getNotifications } = useNotifications();
    const notificationsData = getNotifications.data?.results

    return (
        <>
            {getNotifications.isLoading ? (
                <>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <NotificationCardSkeleton key={index} />
                    ))}
                </>
            ) : getNotifications.isError ? (
                <div className="flex items-center justify-center">Error</div>
            ) : (
                <div className="grid grid-rows-[auto] gap-2 p-4">
                    {notificationsData?.map(notification => (
                        <NotificationCard key={notification.id} notification={notification} />
                    ))}
                </div>
            )}
        </>
    )
}

export default NotificationsPage