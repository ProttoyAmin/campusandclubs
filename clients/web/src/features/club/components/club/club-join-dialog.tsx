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

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  clubId?: string;
  
};

export function ClubJoinDialog({
  open,
  onOpenChange,
  title,
  description,
  clubId
}: DialogProps) {
  const { mutate: applyToClub } = useApplyToClub(clubId || "", "");
  const onSubmit = (data: MembershipApplicationCreateRequest) => {
    console.log(data);
    applyToClub(data, { onSuccess: () => onOpenChange(false) });
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
