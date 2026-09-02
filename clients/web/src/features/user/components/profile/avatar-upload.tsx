import { Input } from "design/components/ui/input";
import { useRef, useState } from "react";
import { CameraIcon } from "lucide-react";

type AvatarUploadProps = {
    username: string;
    currentAvatar?: string | null;
    avatar: File | null;
    setAvatar: React.Dispatch<React.SetStateAction<File | null>>;
    onSubmit: (avatar: File | null) => void;
    isPending?: boolean;
};

export function AvatarUpload({
    username,
    currentAvatar,
    avatar,
    setAvatar,
    onSubmit,
    isPending,
}: AvatarUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const previewUrl = avatar
        ? URL.createObjectURL(avatar)
        : currentAvatar;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setAvatar(file);
        onSubmit(file)
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <label
                htmlFor="avatar-upload"
                className="cursor-pointer"
            >
                <div className="size-24 overflow-hidden rounded-full relative">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={`${username}'s avatar`}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-muted text-2xl font-medium">
                            {username[0]?.toUpperCase()}
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full">
                        <CameraIcon className="text-white text-sm" />
                    </div>
                </div>
            </label>

            <Input
                ref={inputRef}
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* <button type="button" onClick={handleSubmit}>
                Submit
            </button> */}
        </div>
    );
}