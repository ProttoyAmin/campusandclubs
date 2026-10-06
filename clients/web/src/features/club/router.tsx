import ClubRequestsLayout from "@/layouts/club/club-config/requests-layout";
import ClubsLayout from "@/layouts/club/clubs-layout";
import ClubConfigLayout from "@/layouts/club/config-layout";
import ClubShellLayout from "@/layouts/club/club-shell";
import { routes } from "@/settings/routes";
import React from "react";

const Clubs = React.lazy(() => import("./pages/private/clubs"));
const ClubPage = React.lazy(() => import("./pages/public/club-page"));
const ClubMedia = React.lazy(() => import("./pages/private/c-media"));
const ClubPosts = React.lazy(() => import("./pages/private/c-posts"));
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
  // Top-level /@/clubs/ (list)
  {
    id: "clubs-page-layout",
    path: routes.club.private.list,
    element: <ClubsLayout />,
    children: [{ id: "clubs-base", index: true, element: <Clubs /> }],
  },
  // Everything under /@/clubs/:slug/* shares the shell (banner + header).
  {
    id: "club-shell",
    path: routes.club.public.base, // /@/clubs/:slug/
    element: <ClubShellLayout />,
    children: [
      // Public profile pages (posts, media) — ClubPage wraps them with tabs.
      {
        id: "club-main",
        element: <ClubPage />,
        children: [
          { id: "club-posts", index: true, element: <ClubPosts /> },
          { id: "club-media", path: "media", element: <ClubMedia /> },
        ],
      },
      // Owner config pages.
      {
        id: "club-config-layout",
        path: "config",
        element: <ClubConfigLayout />,
        children: [
          { id: "club-config-info", index: true, element: <Info /> },
          { id: "club-permissions", path: "permissions", element: <Permissions /> },
          { id: "club-members", path: "members", element: <Members /> },
          {
            id: "club-requests-layout",
            path: "requests",
            element: <ClubRequestsLayout />,
            children: [
              { id: "club-requests", index: true, element: <Requests /> },
              { id: "club-requests-approved", path: "approved", element: <Approved /> },
              { id: "club-requests-pending", path: "pending", element: <Pending /> },
              { id: "club-requests-rejected", path: "rejected", element: <Rejected /> },
            ],
          },
          { id: "club-settings", path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];
