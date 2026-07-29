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
    
  },


  
  public: {
    home: routes.home,
    auth: {
      signIn: routes.auth.public.sign_in,
      signUp: routes.auth.public.sign_up,
    },
  },
} as const;
