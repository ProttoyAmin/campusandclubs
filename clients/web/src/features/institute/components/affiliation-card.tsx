import { ShieldCheck, Clock, XCircle } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "design/components/ui/avatar";
import { type Institute } from "@campus/api";
import { CardContent } from "design/components/ui/card";
import { useMe } from "@/features/user/hooks/user.hooks";
import { type UserProfile } from "@campus/api";

const useCachedUser = () => {
  const { data } = useMe();
  const user = data as UserProfile

  return user;
}

type AffiliationStatus = "pending" | "verified" | "rejected";

type Affiliation = {
  id: string | number;
  institute: Institute;
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
  const user = useCachedUser();
  console.log(user);

  return (
    <div className="border rounded-md">
      {/* <pre>{JSON.stringify(affiliation, null, 2)}</pre> */}
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex flex-col gap-6 items-center">
          <Avatar>
            <AvatarImage src={affiliation.institute.logo || undefined} />
            <AvatarFallback>{affiliation.institute.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
          </Avatar>
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
          <p className="text-xs text-muted-foreground mt-6 capitalize">
            {affiliation.role}
          </p>
        </div>
      </CardContent>
    </div>
  );
};

export default AffiliationCard;
