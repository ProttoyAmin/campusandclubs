export const userRoutes = {
    private: {
        me: '/me',
        profile: {
            username: '/@/u/:username',
        },
        settings: '@/u/:username/settings',
    }
} as const;