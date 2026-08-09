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
      affilications: routes.settings.affiliations,
    },

    activity: {
      base: routes.activity.base,
      follows: routes.activity.follows,
      likes: routes.activity.likes,
      replies: routes.activity.replies,
    },

    club: {
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

      requests: (slug: string) =>
        generateRouteFromPath(routes.club.private.config.requests, {
          slug,
        }),
      settings: (slug: string) =>
        generateRouteFromPath(routes.club.private.config.settings, {
          slug,
        }),
    },

    // auth: {
    //   activation: routes.auth.private.activation,
    // }
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
