import { Building2, ShieldCheck, Clock, XCircle } from "lucide-react";

import { Card, CardContent } from "design/components/ui/card";

type AffiliationStatus = "pending" | "verified" | "rejected";

type Affiliation = {
  id: string | number;
  institute: { id: string; name: string; code?: string | null };
  role: string;
  status: AffiliationStatus;
};

const STATUS_META: Record<
  AffiliationStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  pending: {
    label: "Pending verification",
    icon: Clock,
    className: "border border-border bg-background text-foreground",
  },
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "bg-primary text-primary-foreground",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive text-destructive-foreground",
  },
};

const AffiliationCard = ({ affiliation }: { affiliation: Affiliation }) => {
  const meta = STATUS_META[affiliation.status];
  const StatusIcon = meta.icon;

  return (
    <Card>
      <CardContent className="flex items-start gap-3 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Building2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {affiliation.institute.name}
              </p>
              {affiliation.institute.code && (
                <p className="text-xs text-muted-foreground">
                  {affiliation.institute.code}
                </p>
              )}
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}
            >
              <StatusIcon className="size-3" />
              {meta.label}
            </span>
          </div>
          <div className="my-3 h-px bg-border" />
          <p className="text-xs text-muted-foreground">
            Role:{" "}
            <span className="font-medium capitalize text-foreground">
              {affiliation.role}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliationCard;
