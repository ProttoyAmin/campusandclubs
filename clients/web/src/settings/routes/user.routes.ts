export const userRoutes = {
    private: {
        me: '/me',
        profile: {
            username: '/@/u/:username',
        },
        settings: {
            base: '/@/u/:username/settings',
            account: '/@/u/:username/settings/account',
            affilications: '/@/u/:username/settings/affilications',
            privacy: '/@/u/:username/settings/privacy',
        },
    },
    public: {
        profile: '/@/u/:username',
    },
} as const;