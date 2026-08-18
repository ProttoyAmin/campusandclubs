export const clubRoutes = {
  private: {
    list: "/@/clubs/",
    create: "/@/clubs/create/",
    config: {
      base: "/@/clubs/:slug/config/",
      permissions: "/@/clubs/:slug/config/permissions/",
      members: "/@/clubs/:slug/config/members/",
      requests: {
        base: "/@/clubs/:slug/config/requests/",
        approved: "/@/clubs/:slug/config/requests/approved/",
        pendings: "/@/clubs/:slug/config/requests/pendings/",
        rejected: "/@/clubs/:slug/config/requests/rejected/",
      },
      settings: "/@/clubs/:slug/config/settings/",
    },
  },
  public: {
    base: "/@/clubs/:slug/",
  },
} as const;
