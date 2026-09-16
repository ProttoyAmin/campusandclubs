import { routes } from "./__main__";
import { generateRouteFromPath } from "./utils";

export const paths = {
  private: {
    user: {
      me: routes.user.private.me,
      profile: (username: string) =>
        generateRouteFromPath(routes.user.private.profile.username, {
          username,
        }),
      posts: {
        list: (username: string) =>
          generateRouteFromPath(routes.user.private.profile.posts.list, {
            username,
          }),
        detail: (username: string, postId: string) =>
          generateRouteFromPath(routes.user.private.profile.posts.detail, {
            username,
            postId,
          }),
      },
      reels: (username: string) =>
        generateRouteFromPath(routes.user.private.profile.reels, {
          username,
        }),
      reposts: (username: string) =>
        generateRouteFromPath(routes.user.private.profile.reposts, {
          username,
        }),

      media: (username: string) =>
        generateRouteFromPath(routes.user.private.profile.media, {
          username,
        }),

      settings: {
        base: (username: string) =>
          generateRouteFromPath(routes.user.private.settings.base, {
            username,
          }),
        account: (username: string) =>
          generateRouteFromPath(routes.user.private.settings.account, {
            username,
          }),

        affilications: (username: string) =>
          generateRouteFromPath(routes.user.private.settings.affilications, {
            username,
          }),

        privacy: (username: string) =>
          generateRouteFromPath(routes.user.private.settings.privacy, {
            username,
          }),
      },
    },

    settings: {
      base: routes.settings.base,
      account: routes.settings.account,
      privacy: routes.settings.privacy,
      affiliations: routes.settings.affiliations,
    },

    activity: {
      base: routes.activity.base,
      follows: routes.activity.follows,
      likes: routes.activity.likes,
      replies: routes.activity.comments,
    },

    club: {
      list: routes.club.private.list,
      create: routes.club.private.create,
      posts: (slug: string) =>
        generateRouteFromPath(routes.club.private.posts, {
          slug,
        }),
      media: (slug: string) =>
        generateRouteFromPath(routes.club.private.media, {
          slug,
        }),
      config: (slug: string) =>
        generateRouteFromPath(routes.club.private.config.base, {
          slug,
        }),
      permissions: (slug: string) =>
        generateRouteFromPath(routes.club.private.config.permissions, {
          slug,
        }),
      members: (slug: string) =>
        generateRouteFromPath(routes.club.private.config.members, {
          slug,
        }),

      requests: {
        base: (slug: string) =>
          generateRouteFromPath(routes.club.private.config.requests.base, {
            slug,
          }),
        approved: (slug: string) =>
          generateRouteFromPath(routes.club.private.config.requests.approved, {
            slug,
          }),
        pendings: (slug: string) =>
          generateRouteFromPath(routes.club.private.config.requests.pendings, {
            slug,
          }),
        rejected: (slug: string) =>
          generateRouteFromPath(routes.club.private.config.requests.rejected, {
            slug,
          }),
      },
      settings: (slug: string) =>
        generateRouteFromPath(routes.club.private.config.settings, {
          slug,
        }),
    },

    chat: {
      inbox: routes.chat.inbox,
      request: routes.chat.request,
    },

    auth: {
      activation: routes.auth.private.activation,
      forgot_password: routes.auth.private.forgot_password,
      reset_password: (key: string) =>
        generateRouteFromPath(routes.auth.private.reset_password, {
          key,
        }),

      verify_email: (key: string) =>
        generateRouteFromPath(routes.auth.private.verify_email, {
          key,
        }),

      verify_email_otp: routes.auth.private.verify_email_otp,
    },
  },

  public: {
    home: routes.home,
    auth: {
      signIn: routes.auth.public.sign_in,
      signUp: routes.auth.public.sign_up,
    },

    club: {
      slug: (slug: string) =>
        generateRouteFromPath(routes.club.public.base, {
          slug,
        }),
    },
  },
} as const;
