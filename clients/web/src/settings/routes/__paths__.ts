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
      settings: (username: string) =>
        generateRouteFromPath(routes.user.private.settings, {
          username,
        }),
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
    }

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
