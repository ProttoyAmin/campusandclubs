export const clubRoutes = {
  private: {
    list: "/@/clubs/",
    posts: "/@/clubs/:slug/posts/",
    media: "/@/clubs/:slug/media/",
    create: "/@/clubs/create/",
    config: {
      base: "/@/clubs/:slug/config/",
      info: "/@/clubs/:slug/config/info/",
      permissions: "/@/clubs/:slug/config/permissions/",
      members: "/@/clubs/:slug/config/members/",
      requests: {
        base: "/@/clubs/:slug/config/requests/",
        approved: "/@/clubs/:slug/config/requests/approved/",
        pendings: "/@/clubs/:slug/config/requests/pendings/",
        rejected: "/@/clubs/:slug/config/requests/rejected/",
      },
      submissions: {
        base: "/@/clubs/:slug/config/submissions/",
        form: "/@/clubs/:slug/config/submissions/form/",
      },
      settings: {
        base: "/@/clubs/:slug/config/settings/",
        privacy: "/@/clubs/:slug/config/settings/privacy/",
        scope: "/@/clubs/:slug/config/settings/scope/",
      },
    },
  },
  public: {
    base: "/@/clubs/:slug/",
  },
} as const;
