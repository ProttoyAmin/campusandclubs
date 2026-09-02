// import UserSettingsLayout from "@/layouts/user/user-settings-layout";
import { routes } from "@/settings/routes";
import React from "react";

const Profile = React.lazy(() => import("./pages/public/Profile"));
const UserPosts = React.lazy(() => import("./pages/private/posts/user-posts"))
const UserReels = React.lazy(() => import("./pages/private/reels/user-reels"))
const UserReposts = React.lazy(() => import("./pages/private/reposts/user-reposts"))
const UserMedia = React.lazy(() => import("./pages/private/media/user-media"))
const Account = React.lazy(
  () => import("./pages/private/profile-settings/account-page"),
);
const Affiliations = React.lazy(
  () => import("./pages/private/profile-settings/affiliations-page"),
);

const Privacy = React.lazy(
  () => import("./pages/private/profile-settings/privacy-page"),
);

const Settings = React.lazy(
  () => import("./pages/private/profile-settings/settings-page"),
);

export const userRoutes = [
  {
    id: "user-profile",
    path: routes.user.public.profile,
    element: <Profile />,
    children: [
      {
        id: "user-profile-posts",
        index: true,
        element: <UserPosts />,
      },
      {
        id: "user-profile-reels",
        path: routes.user.private.profile.reels,
        element: <UserReels />,
      },
      {
        id: "user-profile-reposts",
        path: routes.user.private.profile.reposts,
        element: <UserReposts />,
      },
      {
        id: "user-profile-media",
        path: routes.user.private.profile.media,
        element: <UserMedia />,
      },
    ],
  },
];

export const userSettingsRoutes = [
  {
    id: "user-settings",
    path: routes.settings.base,
    element: <Settings />,
  },
  {
    id: "user-settings-account",
    path: routes.settings.account,
    element: <Account />,
  },
  {
    id: "user-settings-affiliations",
    path: routes.settings.affiliations,
    element: <Affiliations />,
  },
  {
    id: "user-settings-privacy",
    path: routes.settings.privacy,
    element: <Privacy />,
  },
];
