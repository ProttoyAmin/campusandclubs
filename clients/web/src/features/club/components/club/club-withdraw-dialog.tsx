import { useWithdraw } from "../../hooks/club.hooks";
import { useParams } from "react-router-dom";
import { toast } from "design/components/ui/toast";
import AppAlertDialog from "@/shared/components/alert";

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
    <AppAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      cancelText="Cancel"
      confirmText="Withdraw"
      onConfirm={onSubmit}
      onCancel={() => onOpenChange(false)}
      variant="outline"
    />
  );
}
