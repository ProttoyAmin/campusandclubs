import { routes } from "@/settings/routes";
import { pageTitle } from "../meta";
import type { RouteNode } from "../types";

/** Children of the pathless UserProfileLayout branch. */
export const userBranch: RouteNode[] = [
    {
        id: "user-profile",
        path: routes.user.public.profile,
        page: () => import("@/features/user/pages/public/Profile"),
        meta: ({ params }) => ({
            title: pageTitle(`@${params.username ?? "profile"}`),
        }),
        children: [
            {
                id: "user-profile-posts",
                index: true,
                page: () => import("@/features/user/pages/private/posts/user-posts"),
            },
            {
                id: "user-profile-reels",
                path: routes.user.private.profile.reels,
                page: () => import("@/features/user/pages/private/reels/user-reels"),
            },
            {
                id: "user-profile-reposts",
                path: routes.user.private.profile.reposts,
                page: () =>
                    import("@/features/user/pages/private/reposts/user-reposts"),
            },
            {
                id: "user-profile-media",
                path: routes.user.private.profile.media,
                page: () => import("@/features/user/pages/private/media/user-media"),
            },
        ],
    },
    {
        id: "user-profile-post",
        path: routes.user.private.profile.posts.detail,
        page: () => import("@/features/user/pages/private/posts/post-detail"),
        meta: ({ params }) => ({
            title: pageTitle(`Post by @${params.username ?? ""}`),
        }),
    },
];

const settingsPage = (
    id: string,
    path: string,
    title: string,
    page: RouteNode["page"],
): RouteNode => ({ id, path, page, meta: { title: pageTitle(title) } });

/** Children of the SettingsLayout branch (noindex is set on the branch). */
export const settingsBranch: RouteNode[] = [
    settingsPage(
        "user-settings",
        routes.settings.base,
        "Settings",
        () =>
            import("@/features/user/pages/private/profile-settings/settings-page"),
    ),
    settingsPage(
        "user-settings-account",
        routes.settings.account.base,
        "Account",
        () => import("@/features/user/pages/private/profile-settings/account-page"),
    ),
    settingsPage(
        "user-settings-affiliations",
        routes.settings.affiliations,
        "Affiliations",
        () =>
            import("@/features/user/pages/private/profile-settings/affiliations-page"),
    ),
    settingsPage(
        "user-settings-privacy",
        routes.settings.privacy.base,
        "Privacy",
        () => import("@/features/user/pages/private/profile-settings/privacy-page"),
    ),
    settingsPage(
        "user-settings-privacy-account",
        routes.settings.privacy.account,
        "Account privacy",
        () =>
            import("@/features/user/pages/private/profile-settings/privacy/account-privacy"),
    ),
    settingsPage(
        "user-settings-sessions",
        routes.settings.account.sessions,
        "Sessions",
        () =>
            import("@/features/user/pages/private/profile-settings/account/sessions-page"),
    ),
    settingsPage(
        "user-settings-privacy-online-status",
        routes.settings.privacy.onlineStatus,
        "Online status",
        () =>
            import("@/features/user/pages/private/profile-settings/privacy/online-status"),
    ),
    settingsPage(
        "user-settings-privacy-messages",
        routes.settings.privacy.messages,
        "Message privacy",
        () =>
            import("@/features/user/pages/private/profile-settings/privacy/message-privacy"),
    ),
    settingsPage(
        "user-settings-privacy-blocked-users",
        routes.settings.privacy.blockedUsers,
        "Blocked users",
        () =>
            import("@/features/user/pages/private/profile-settings/privacy/blocked-users"),
    ),
    settingsPage(
        "user-settings-account-password",
        routes.settings.account.password,
        "Password",
        () =>
            import("@/features/user/pages/private/profile-settings/account/passwords-page"),
    ),
    settingsPage(
        "user-settings-account-email",
        routes.settings.account.email,
        "Email",
        () =>
            import("@/features/user/pages/private/profile-settings/account/email-page"),
    ),
];
