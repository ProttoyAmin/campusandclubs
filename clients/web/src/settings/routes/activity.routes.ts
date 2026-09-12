export const activityRoutes = {
    base: "/activity",
    follows: {
        sent: "/activity/follows/sent",
        requests: "/activity/follows/requests",
        received: "/activity/follows/received",
    },
    likes: "/activity/likes",
    comments: "/activity/comments",
    replies: "/activity/replies",
} as const;
