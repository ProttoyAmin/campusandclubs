import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "design/components/ui/dialog";
import ProfileUpdateForm from "@/components/forms/user/profile-update";
import type { UserProfile } from "@campus/api";
import type { updateProfileSchema } from "validation/user";
import type z from "zod";
import React from "react";
import { useUpdateProfile } from "../../hooks/user.hooks";
import { useParams } from "react-router-dom";

type DialogProps = {
  trigger: React.ReactElement;
  title?: string;
  description?: string;
  data: UserProfile;
};

export function EditProfileDialog({
  trigger,
  title,
  description,
  data,
}: DialogProps) {
  const { username } = useParams();
  const { mutate: updateProfile, isPending } = useUpdateProfile(username!);
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProfileUpdateForm
          onSubmit={(values: z.infer<typeof updateProfileSchema>) => {
            updateProfile(values, {
              onSuccess: () => {
                setOpen(false);
              },
            });
          }}
          data={data}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
