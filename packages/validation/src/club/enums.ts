export const StatusOptions = ["active", "paused", "archived", "suspended"] as const;
export const PrivacyOptions = ["public", "private", "secret"] as const;
export const ScopeOptions = ["global", "exclusive", "cross_institute"] as const;
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
    Global = "global",
    Exclusive = "exclusive",
    CrossInstitute = "cross_institute",
}

export enum JoinMode {
    Instant = "instant",
    Application = "application",
    InviteOnly = "invite_only",
}
