// import UserSettingsLayout from "@/layouts/user/user-settings-layout";
import { routes } from "@/settings/routes";
import React from "react";
import PasswordsPage from "./pages/private/profile-settings/account/passwords-page";
import EmailPage from "./pages/private/profile-settings/account/email-page";

const Profile = React.lazy(() => import("./pages/public/Profile"));
const UserPosts = React.lazy(() => import("./pages/private/posts/user-posts"))
const PostDetail = React.lazy(() => import("./pages/private/posts/post-detail"))
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

const AccountPrivacy = React.lazy(
  () => import("./pages/private/profile-settings/privacy/account-privacy"),
);

const OnlineStatusPrivacy = React.lazy(
  () => import("./pages/private/profile-settings/privacy/online-status"),
);

const MessagePrivacy = React.lazy(
  () => import("./pages/private/profile-settings/privacy/message-privacy"),
);

const BlockedUsers = React.lazy(
  () => import("./pages/private/profile-settings/privacy/blocked-users"),
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
  {
    id: "user-profile-post",
    path: routes.user.private.profile.posts.detail,
    element: <PostDetail />,
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
    path: routes.settings.account.base,
    element: <Account />,
  },
  {
    id: "user-settings-affiliations",
    path: routes.settings.affiliations,
    element: <Affiliations />,
  },
  {
    id: "user-settings-privacy",
    path: routes.settings.privacy.base,
    element: <Privacy />,
  },
  {
    id: "user-settings-privacy-account",
    path: routes.settings.privacy.account,
    element: <AccountPrivacy />,
  },
  {
    id: "user-settings-privacy-online-status",
    path: routes.settings.privacy.onlineStatus,
    element: <OnlineStatusPrivacy />,
  },
  {
    id: "user-settings-privacy-messages",
    path: routes.settings.privacy.messages,
    element: <MessagePrivacy />,
  },
  {
    id: "user-settings-privacy-blocked-users",
    path: routes.settings.privacy.blockedUsers,
    element: <BlockedUsers />,
  },
  {
    id: "user-settings-account-password",
    path: routes.settings.account.password,
    element: <PasswordsPage />,
  },
  {
    id: "user-settings-account-email",
    path: routes.settings.account.email,
    element: <EmailPage />,
  },
];
