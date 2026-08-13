export const clubRoutes = {
  private: {
    config: {
      base: "/@/c/:slug/config/",
      permissions: "/@/c/:slug/config/permissions/",
      members: "/@/c/:slug/config/members/",
      requests: {
        base: "/@/c/:slug/config/requests/",
        approved: "/@/c/:slug/config/requests/approved/",
        pendings: "/@/c/:slug/config/requests/pendings/",
        rejected: "/@/c/:slug/config/requests/rejected/",
      },
      settings: "/@/c/:slug/config/settings/",
    },
  },
  public: {
    base: "/@/c/:slug/",
  },
} as const;
