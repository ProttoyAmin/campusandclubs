export interface ApplicationType {
    id: string;
    applicant: {
        id: string;
        name: string;
        username: string;
        avatar: string;
    };
    club: string;
    status: "pending" | "approved" | "rejected" | "withdrawn";
    reviewed_by: string | any;
    reviewed_at: string | any;
    message: string | null;
}