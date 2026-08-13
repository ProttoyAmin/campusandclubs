import ClubRequestsLayout from "@/layouts/club/club-config/requests-layout";
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
const Info = React.lazy(() => import("./pages/private/config-club/info-page"));
const Requests = React.lazy(
  () => import("./pages/private/config-club/requests-page"),
);

const Approved = React.lazy(
  () => import("./pages/private/config-club/requests/approved"),
);

const Pending = React.lazy(
  () => import("./pages/private/config-club/requests/pending"),
);

const Rejected = React.lazy(
  () => import("./pages/private/config-club/requests/rejected"),
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
        element: <Info />,
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
        id: "club-requests-layout",
        path: routes.club.private.config.requests.base,
        element: <ClubRequestsLayout />,
        children: [
          {
            id: "club-requests",
            index: true,
            element: <Requests />,
          },
          {
            id: "club-requests-approved",
            path: routes.club.private.config.requests.approved,
            element: <Approved />,
          },
          {
            id: "club-requests-pending",
            path: routes.club.private.config.requests.pendings,
            element: <Pending />,
          },
          {
            id: "club-requests-rejected",
            path: routes.club.private.config.requests.rejected,
            element: <Rejected />,
          },
        ],
      },
      {
        id: "club-settings",
        path: routes.club.private.config.settings,
        element: <Settings />,
      },
    ],
  },
];
