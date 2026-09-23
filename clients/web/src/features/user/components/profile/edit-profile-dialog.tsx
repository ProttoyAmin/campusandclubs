import ProfileUpdateForm from "@/components/forms/user/profile-update";
import type { UserProfile } from "@campus/api";
import type { updateProfileSchema } from "validation/user";
import type z from "zod";
import React from "react";
import { useProfile, useUpdateProfile } from "../../hooks/user.hooks";
import { useAvatarUpload } from "../../hooks/use-avatar-upload";
import { useParams } from "react-router-dom";
import { AvatarUpload } from "./avatar-upload";
import AppDialog, { type DialogProps } from "@/shared/components/app-dialog";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import { toast } from "design/components/ui/toast";

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
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const { username } = useParams();
  const { updateProfile } = useProfile(username as string);
  const avatarUpload = useAvatarUpload();
  const [open, setOpen] = React.useState(false);

  // Revoke blob URLs when component unmounts / preview changes.
  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAvatarChange = (file: File | null) => {
    setAvatar(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAvatarSubmit = (file: File | null) => {
    if (!file) return;
    avatarUpload.mutate(file, {
      onSuccess: () => {
        toast.add({ title: "Avatar updated", type: "success" });
        setAvatar(null);
      },
      onError: () => toast.add({ title: "Failed to upload avatar", type: "error" }),
    });
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
        currentAvatar={previewUrl ?? data.avatar}
        avatar={avatar}
        setAvatar={handleAvatarChange}
        onSubmit={handleAvatarSubmit}
        isPending={updateProfile.isPending || avatarUpload.isPending}
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
