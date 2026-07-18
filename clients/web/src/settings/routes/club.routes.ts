export const clubRoutes = {
    private: {
        settings: '/@/c/:clubId/settings',
    },
    public: {
        club: '/@/c/:clubId',
        slug: '/@/c/:slug',
    },
} as const;