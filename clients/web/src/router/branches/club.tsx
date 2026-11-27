import { routes } from "@/settings/routes";
import { extendMeta, pageTitle } from "../meta";
import type { MetaDescriptor, RouteNode } from "../types";

const clubTitle =
    (suffix?: string): MetaDescriptor =>
    ({ params }) => ({
        title: pageTitle(suffix ? `${suffix} · ${params.slug ?? "club"}` : params.slug ?? "Club"),
    });

const config = routes.club.private.config;

/** Children of the pathless ClubMainLayout branch. */
export const clubBranch: RouteNode[] = [
    {
        // routes.tsx registers this as an `index` of a pathless layout under "/",
        // which collides with the home index (so /@/clubs/ fell through to the
        // "/@/:username/" profile route). Giving it its real path fixes that.
        id: "clubs-base",
        path: routes.club.private.list,
        page: () => import("@/features/club/pages/private/clubs"),
        meta: { title: pageTitle("Clubs") },
    },
    {
        id: "club-main",
        path: routes.club.public.base,
        page: () => import("@/features/club/pages/public/club-page"),
        meta: clubTitle(),
        children: [
            {
                id: "club-posts",
                index: true,
                page: () => import("@/features/club/pages/private/c-posts"),
            },
            {
                id: "club-media",
                path: routes.club.private.media,
                page: () => import("@/features/club/pages/private/c-media"),
                meta: clubTitle("Media"),
            },
        ],
    },
    {
        id: "club-config-layout",
        path: config.base,
        page: () => import("@/layouts/club/config-layout"),
        meta: extendMeta(clubTitle("Settings"), { robots: "noindex,nofollow" }),
        children: [
            {
                id: "club-config",
                path: config.info,
                page: () => import("@/features/club/pages/private/config-club/info-page"),
                meta: clubTitle("Info"),
            },
            {
                id: "club-roles-permissions",
                path: config.roles,
                page: () => import("@/features/club/pages/private/config-club/permissions-page"),
                meta: clubTitle("Roles"),
            },
            {
                id: "club-role-details-layout",
                path: config.roleDetails,
                page: () => import("@/layouts/club/club-config/roles-layout"),
                meta: clubTitle("Roles"),
                children: [
                    {
                        id: "club-role-details",
                        index: true,
                        page: () => import("@/features/club/pages/private/config-club/roles-permissions/role-details"),
                    },
                    {
                        id: "club-role-detail-layout",
                        path: config.roleId,
                        page: () => import("@/layouts/club/club-config/role-layout"),
                        children: [
                            {
                                id: "club-role-detail",
                                index: true,
                                page: () => import("@/features/club/pages/private/config-club/roles-permissions/role-detail"),
                            },
                            {
                                id: "club-role-permissions",
                                path: config.rolePermissions,
                                page: () => import("@/features/club/pages/private/config-club/roles-permissions/role-detail"),
                            },
                            {
                                id: "club-role-members",
                                path: config.roleMembers,
                                page: () => import("@/features/club/pages/private/config-club/roles-permissions/role-detail"),
                            },
                        ],
                    },
                ],
            },
            {
                id: "club-invites",
                path: config.invites.base,
                page: () => import("@/features/club/pages/private/config-club/invite"),
                meta: clubTitle("Invites"),
            },
            {
                id: "club-members",
                path: config.members,
                page: () => import("@/features/club/pages/private/config-club/members-page"),
                meta: clubTitle("Members"),
            },
            {
                id: "club-submissions",
                path: config.submissions.base,
                page: () => import("@/features/club/pages/private/config-club/submissions/index"),
                meta: clubTitle("Submissions"),
            },
            {
                id: "club-submissions-form",
                path: config.submissions.form,
                page: () => import("@/features/club/pages/private/config-club/submissions/submission-form"),
                meta: clubTitle("Submission form"),
            },
            {
                id: "club-requests-layout",
                path: config.requests.base,
                page: () => import("@/layouts/club/club-config/requests-layout"),
                meta: clubTitle("Requests"),
                children: [
                    {
                        id: "club-requests",
                        index: true,
                        page: () => import("@/features/club/pages/private/config-club/requests-page"),
                    },
                    {
                        id: "club-requests-approved",
                        path: config.requests.approved,
                        page: () => import("@/features/club/pages/private/config-club/requests/approved"),
                    },
                    {
                        id: "club-requests-pending",
                        path: config.requests.pendings,
                        page: () => import("@/features/club/pages/private/config-club/requests/pending"),
                    },
                    {
                        id: "club-requests-rejected",
                        path: config.requests.rejected,
                        page: () => import("@/features/club/pages/private/config-club/requests/rejected"),
                    },
                ],
            },
            {
                id: "club-settings",
                path: config.settings.base,
                page: () => import("@/features/club/pages/private/config-club/settings-page"),
                meta: clubTitle("Settings"),
            },
            {
                id: "club-settings-privacy",
                path: config.settings.privacy,
                page: () => import("@/features/club/pages/private/config-club/c-settings/privacy"),
                meta: clubTitle("Privacy"),
            },
            {
                id: "club-settings-scope",
                path: config.settings.scope,
                page: () => import("@/features/club/pages/private/config-club/c-settings/scope"),
                meta: clubTitle("Scope"),
            },
        ],
    },
];
