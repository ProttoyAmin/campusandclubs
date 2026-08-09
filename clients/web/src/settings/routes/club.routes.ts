export const clubRoutes = {
  private: {
    config: {
      base: "/@/c/:slug/config/",
      permissions: "/@/c/:slug/config/permissions/",
      members: "/@/c/:slug/config/members/",
      requests: "/@/c/:slug/config/requests/",
      settings: "/@/c/:slug/config/settings/",
    },
  },
  public: {
    base: "/@/c/:slug/",
  },
} as const;
