import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "design/components/ui/dialog";

type DialogProps = {
  trigger: React.ReactElement;
  title?: string;
  description?: string;
};

export function EditProfileDialog({ trigger, title, description }: DialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger}>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ? description : "edit your profile here"}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
