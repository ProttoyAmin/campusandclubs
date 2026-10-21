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
import { Button } from "design/components/ui/button";
import { pingMedia, uploadProfilePicture } from "@/library/media";

type ProfileDialog = Omit<DialogProps, 'children'> & {
  data: UserProfile;
  uploadAvatar: (avatar: File) => void;
};

export function EditProfileDialog({
  trigger,
  title,
  description,
  data,
  uploadAvatar,
}: ProfileDialog) {
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const { username } = useParams();
  const { updateProfile } = useProfile(username as string)
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (formData: any, isDirty?: boolean) => {
    console.log(formData, isDirty);

    if (isDirty) {
      await updateProfile.mutateAsync(formData)
      setOpen(false)
    }

    if (avatar) {
      // const payload = {
      //   target_type: "user",
      //   media: avatar,
      //   object_id: data.id,
      //   role: "avatar"

      // }
      // const res = await uploadProfilePicture(payload);
      // console.log(res);
      uploadAvatar(avatar);
    }
    // if (avatar) {
    //   const res = await pingMedia()
    //   console.log(res)
    // }
    // await updateProfile.mutate(data)
  };

  return (
    <ResponsiveDialog
      trigger={trigger}
      title={title}
      description={description}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col gap-10">
        <AvatarUpload
          username={data?.username || ""}
          currentAvatar={data.avatar}
          avatar={avatar}
          setAvatar={setAvatar}
          onSubmit={handleSubmit}
          isPending={updateProfile.isPending}
        />
        <ProfileUpdateForm
          onSubmit={handleSubmit}
          data={data}
          isPending={updateProfile.isPending}
        />
      </div>
    </ResponsiveDialog>
  );
}
