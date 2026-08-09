// import UserSettingsLayout from "@/layouts/user/user-settings-layout";
import { routes } from "@/settings/routes";
import React from "react";

const Profile = React.lazy(() => import("./pages/public/Profile"));
const Account = React.lazy(
  () => import("./pages/private/profile-settings/account-page"),
);
const Affiliations = React.lazy(
  () => import("./pages/private/profile-settings/affiliations-page"),
);

const Privacy = React.lazy(
  () => import("./pages/private/profile-settings/privacy-page"),
);

export const userRoutes = [
  {
    id: "user-profile",
    path: routes.user.public.profile,
    element: <Profile />,
  },
];

export const userSettingsRoutes = [
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
