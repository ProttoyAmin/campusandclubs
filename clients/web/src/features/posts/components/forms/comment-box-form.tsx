import { Controller, useForm } from "react-hook-form";
import { Input } from "design/components/ui/input";
import { Button } from "design/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";

import {
    Image01Icon,
    Gif01Icon,
    ArrowUp02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { UserProfile } from "@campus/api";
import type { PostExtended } from "../post-card";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type CommentBoxFormHandle = {
    focus: () => void;
    submit: () => void;
    replyTo: (username: string, parentId: string) => void;
};

type CommentBoxFormProps = {
    user: Pick<UserProfile, "id" | "avatar" | "username">;
    post: PostExtended;
    onComment: (data: { content: string, parent: string | null }) => void;
};

const CommentBoxForm = forwardRef<CommentBoxFormHandle, CommentBoxFormProps>(({ user, post, onComment }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

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
        if (form.getValues('content').trim()?.[0] !== "@" && form.getValues('parent')) {
            onComment({
                content: form.getValues('content'),
                parent: null
            })
        } else {
            onComment(data);
        }
        form.reset();
    };

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        submit: () => formRef.current?.requestSubmit(),
        replyTo: (username: string, parentId: string) => {
            const mention = `@${username} `;
            form.setValue("content", mention, { shouldDirty: true });
            form.setValue("parent", parentId);
            requestAnimationFrame(() => {
                inputRef.current?.focus();
                const el = inputRef.current as unknown as HTMLInputElement;
                el?.setSelectionRange?.(mention.length, mention.length, "forward");
            });
        },
    }));

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center gap-2"
        >
            {/* Input */}
            <div className="relative flex-1">
                <Controller
                    control={control}
                    name="content"
                    render={({ field }) => (
                        <Input
                            {...field}
                            ref={inputRef}
                            autoFocus
                            autoComplete="off"
                            placeholder={`Reply to @${post.author.username}...`}
                            className="
                h-14
                rounded-full
                pl-14
                bg-muted/30
                text-sm
                shadow-none
                focus-visible:ring-1
                focus-visible:ring-offset-0
              "
                        />
                    )}
                />

                <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>
                            {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

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
})
export default CommentBoxForm;