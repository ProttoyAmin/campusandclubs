import ProfileUpdateForm from "@/components/forms/user/profile-update";
import type { UserProfile } from "@campus/api";
import type { updateProfileSchema } from "validation/user";
import type z from "zod";
import React from "react";
import { useProfile, useUpdateProfile } from "../../hooks/user.hooks";
import { useParams } from "react-router-dom";
import { AvatarUpload } from "./avatar-upload";
import AppDialog, { type DialogProps } from "@/shared/components/app-dialog";
import ResponsiveDialog from "@/shared/components/responsive-dialog";

type ProfileDialog = Omit<DialogProps, 'children'> & {
  data: UserProfile;
};

export function EditProfileDialog({
  trigger,
  title,
  description,
  data,
}: ProfileDialog) {
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const { username } = useParams();
  const { updateProfile } = useProfile(username as string)
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (avatar: File | null) => {
    console.log("Avatar size:", avatar?.size / 1024);
  };

  return (
    <ResponsiveDialog
      trigger={trigger}
      title={title}
      description={description}
      open={open}
      onOpenChange={setOpen}
    >
      <AvatarUpload
        username={data?.username || ""}
        currentAvatar={data.avatar}
        avatar={avatar}
        setAvatar={setAvatar}
        onSubmit={handleSubmit}
        isPending={updateProfile.isPending}
      />
      <ProfileUpdateForm
        onSubmit={(values: z.infer<typeof updateProfileSchema>) => {
          updateProfile.mutate(values, {
            onSuccess: () => {
              setOpen(false);
            },
          });
        }}
        data={data}
        isPending={updateProfile.isPending}
      />
    </ResponsiveDialog>
  );
}
