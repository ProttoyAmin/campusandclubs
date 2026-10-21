export const StatusOptions = ["active", "paused", "archived", "suspended"] as const;
export const PrivacyOptions = ["public", "private", "secret"] as const;
export const ScopeOptions = ["open", "exclusive", "intra"] as const;
export const JoinModeOptions = ["instant", "application", "invite_only"] as const;


export enum Status {
    Active = "active",
    Paused = "paused",
    Archived = "archived",
    Suspended = "suspended",
}

export enum Privacy {
    Public = "public",
    Private = "private",
    Secret = "secret",
}

export enum Scope {
    OPEN = "open",
    Exclusive = "exclusive",
    INTRA = "intra",
}

export enum JoinMode {
    Instant = "instant",
    Application = "application",
    InviteOnly = "invite_only",
}
