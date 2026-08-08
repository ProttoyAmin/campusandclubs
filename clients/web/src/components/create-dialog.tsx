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

export function CreateDialog({ trigger, title, description }: DialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger}>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
