import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "design/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "design/components/ui/avatar";
import type { ApplicationType } from "../../types/application";
import { Button } from "design/components/ui/button";
import { useApplication } from "../../hooks/applications.hooks";
import { toast } from "design/components/ui/toast";
import { XIcon, CheckIcon, PencilIcon } from "lucide-react";

interface ApplicationCardProps {
  application: ApplicationType;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const { approve, reject } = useApplication(application.club, application.id);

  const handleApprove = () => {
    approve.mutate(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Application Approved",
          description: "Application approved successfully",
          type: "success",
        });
      },
      onError: () => {
        toast.add({
          title: "Application Not Approved",
          description: "Application not approved successfully",
          type: "error",
        });
      },
    });
  };
  const handleReject = () => {
    reject.mutate(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Application Rejected",
          description: "Application rejected successfully",
          type: "success",
        });
      },
      onError: () => {
        toast.add({
          title: "Application Not Rejected",
          description: "Application not rejected successfully",
          type: "error",
        });
      },
    });
  };

  return (
    <Card
      key={application.id}
      className="md:max-h-20 min-h-20 flex flex-col justify-center"
    >
      <CardContent className="flex flex-col md:flex-row md:items-center md:gap-3 gap-1">
        <Avatar className={"md:w-1/11"}>
          <AvatarImage
            src={application.applicant?.avatar}
            alt={application.applicant?.username}
          />
          <AvatarFallback>
            {application.applicant?.username?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="md:w-xl w-full">
          <CardDescription className="flex flex-col">
            <p className="text-sm font-semibold">
              {application.applicant?.username}
              <span
                className={`text-xs ml-2 ${
                  application?.status === "pending"
                    ? "text-[#e3a014]"
                    : application?.status === "approved"
                      ? "text-[#54e314]"
                      : "text-[#e33b14]"
                }`}
              >
                {application?.status}
              </span>
            </p>
            {application.message && (
              <p className="text-xs text-muted-foreground">
                {application.message}
              </p>
            )}
          </CardDescription>
        </div>
        <div className="md:w-full sm:mt-2">
          {application.status === "pending" ? (
            <CardAction className="flex gap-2">
              <Button
                size="xs"
                onClick={() => handleApprove()}
                variant="outline"
              >
                <CheckIcon className="w-4 h-4" />
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={() => handleReject()}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </CardAction>
          ) : application.status === "approved" ? (
            <CardAction>
              <p className="text-xs text-muted-foreground">
                at{" "}
                {application.reviewed_at &&
                  new Date(application.reviewed_at).toDateString()}
              </p>
            </CardAction>
          ) : (
            <CardAction>
              <p className="text-xs text-muted-foreground">
                at{" "}
                {application.reviewed_at &&
                  new Date(application.reviewed_at).toDateString()}
              </p>
            </CardAction>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;
