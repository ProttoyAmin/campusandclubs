import React from "react";
import { Controller, useForm } from "react-hook-form";

import { Input } from "design/components/ui/input";
import { Button } from "design/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";

import {
    Image01Icon,
    Gif01Icon,
    ArrowUpRight01Icon,
    ArrowUpRight02Icon,
    ArrowUp02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { UserProfile } from "@campus/api";
import type { PostExtended } from "../post-card";

type CommentBoxFormProps = {
    user: Pick<UserProfile, "id" | "avatar" | "username">;
    post: PostExtended;
    onComment: (data: { content: string, parent: string | null }) => void;
};

const CommentBoxForm = ({ user, post, onComment }: CommentBoxFormProps) => {
    const form = useForm<{
        content: string;
        parent: string | null;
    }>({
        defaultValues: {
            content: "",
            parent: null
        },
    });

    const { control, handleSubmit } = form;

    const onSubmit = (data: { content: string, parent: string | null }) => {
        onComment(data);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center gap-2"
        >
            {/* Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            {/* Input */}
            <div className="relative flex-1">
                <Controller
                    control={control}
                    name="content"
                    render={({ field }) => (
                        <Input
                            {...field}
                            autoFocus
                            autoComplete="off"
                            placeholder={`Reply to @${post.author.username}...`}
                            className="
                h-12
                rounded-full
                border
                bg-muted/30
                px-4
                pr-32
                text-sm
                shadow-none
                focus-visible:ring-0
                focus-visible:ring-offset-0
              "
                        />
                    )}
                />

                {/* Actions inside input */}
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {/* Image */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
                    >
                        <HugeiconsIcon
                            icon={Image01Icon}
                            size={20}
                            strokeWidth={1.8}
                        />
                    </Button>

                    {/* GIF */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
                    >
                        <HugeiconsIcon
                            icon={Gif01Icon}
                            size={22}
                            strokeWidth={1.8}
                        />
                    </Button>

                    {/* Submit */}
                    {
                        form.watch("content")
                            ? (
                                <Button
                                    type="submit"
                                    variant="default"
                                    size="icon"
                                    className="h-9 w-9 rounded-full hover:scale-110 transition-all duration-300 animate-[slideInUp_0.3s_ease-out]"
                                >
                                    <HugeiconsIcon
                                        icon={ArrowUp02Icon}
                                        size={21}
                                    />
                                </Button>
                            )
                            : null
                    }
                </div>
            </div>
        </form>
    );
};

export default CommentBoxForm;