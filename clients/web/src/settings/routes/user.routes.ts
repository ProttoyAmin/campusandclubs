export const userRoutes = {
    private: {
        me: '/me',
        profile: {
            username: '/@/u/:username',
        },
        settings: '@/u/:username/settings',
    },
    public: {
        profile: '/@/u/:username',
    },
} as const;