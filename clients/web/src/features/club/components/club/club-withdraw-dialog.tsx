import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "design/components/ui/alert-dialog";
import { useWithdraw } from "../../hooks/club.hooks";
import { useParams } from "react-router-dom";
import { toast } from "design/components/ui/toast";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  clubId?: string;
  applicationId?: string;
};

export function ClubApplicationWithdrawDialog({
  open,
  onOpenChange,
  title,
  description,
  clubId,
  applicationId,
}: DialogProps) {
  const { slug } = useParams();
  const { mutate: withdraw } = useWithdraw(
    clubId || "",
    applicationId || "",
    slug || "",
  );

  const onSubmit = () => {
    withdraw(null, {
      onSuccess: (id) => {
        onOpenChange(false);
        toast.add({
          title: "Application withdrawn",
          description: "Your application has been withdrawn successfully.",
          actionProps: {
            children: "Undo",
            onClick() {
              toast.close(id);
            },
          },
        });
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="default">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => onSubmit()}>
            Withdraw
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
