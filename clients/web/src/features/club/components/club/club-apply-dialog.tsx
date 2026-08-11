import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "design/components/ui/dialog";
import ClubApplicationForm from "@/components/forms/club/apply-club";
import type { MembershipApplicationCreateRequest } from "@campus/api";
import { useApplyToClub } from "../../hooks/club.hooks";
import { useParams } from "react-router-dom";
import { toast } from "design/components/ui/toast";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  clubId?: string;
};

export function ClubApplicationDialog({
  open,
  onOpenChange,
  title,
  description,
  clubId,
}: DialogProps) {
  const { slug } = useParams();
  const { mutate: applyToClub } = useApplyToClub(clubId || "", slug || "");
  const onSubmit = (data: MembershipApplicationCreateRequest) => {
    applyToClub(data, {
      onSuccess: (id) => {
        onOpenChange(false);
        toast.add({
          title: "Application submitted",
          description: "Your application has been submitted successfully.",
          actionProps: {
            children: "Undo",
            onClick() {
              toast.close(id);
            },
          },
        });
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ClubApplicationForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
