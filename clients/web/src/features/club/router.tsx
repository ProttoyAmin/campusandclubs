import { routes } from "@/settings/routes";
import React from "react";


const ClubPage = React.lazy(() => import("./pages/public/club-page"));

export const clubRoutes = [
  { path: routes.club.public.slug, element: <ClubPage /> },
];
