import ClubConfigLayout from "@/layouts/club/config-layout";
import { routes } from "@/settings/routes";
import React from "react";

const ClubPage = React.lazy(() => import("./pages/public/club-page"));
const Settings = React.lazy(
  () => import("./pages/private/config-club/settings-page"),
);
const Permissions = React.lazy(
  () => import("./pages/private/config-club/permissions-page"),
);
const Members = React.lazy(
  () => import("./pages/private/config-club/members-page"),
);
const Config = React.lazy(
  () => import("./pages/private/config-club/config-page"),
);
const Requests = React.lazy(
  () => import("./pages/private/config-club/requests-page"),
);


export const clubRoutes = [
  { id: "club-main", path: routes.club.public.base, element: <ClubPage /> },
  {
    id: "club-config-layout",
    path: routes.club.private.config.base,
    element: <ClubConfigLayout />,
    children: [
      {
        id: "club-config",
        path: routes.club.private.config.base,
        element: <Config />,
      },
      {
        id: "club-permissions",
        path: routes.club.private.config.permissions,
        element: <Permissions />,
      },
      {
        id: "club-members",
        path: routes.club.private.config.members,
        element: <Members />,
      },
      {
        id: "club-requests",
        path: routes.club.private.config.requests,
        element: <Requests />,
      },
      {
        id: "club-settings",
        path: routes.club.private.config.settings,
        element: <Settings />,
      },
    ],
  },
];
