import type { UserSessions } from "../api/user.client";

export function findCurrentSession(sessions: Pick<UserSessions, "data">): UserSessions["data"][number] | undefined {
    if (sessions && sessions.data) return sessions.data.find((session) => session.is_active);
    return undefined
}

export function excludeCurrentSession(sessions: Pick<UserSessions, "data">): UserSessions["data"] {
    return sessions.data.filter((session) => !session.is_active);
}
