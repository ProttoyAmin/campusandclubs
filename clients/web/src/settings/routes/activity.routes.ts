export const activityRoutes = {
    base: "/activity",
    follows: {
        sent: "/activity/follows/sent",
        requests: "/activity/follows/requests",
    },
    likes: "/activity/likes",
    comments: "/activity/comments",
} as const;
