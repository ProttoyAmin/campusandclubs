import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from 'design/components/ui/textarea';
import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import { PostCreateSchema, type PostCreateInput } from "validation/post";
import {
    Field,
    FieldError,
    FieldGroup,
} from "design/components/ui/field";
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTitle,
    AttachmentTrigger,
} from "design/components/ui/attachment";
import { Input } from 'design/components/ui/input';
import { XIcon } from 'lucide-react';
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Image03Icon
} from "@hugeicons/core-free-icons";

interface PostCreateFormProps {
    user?: {
        username: string;
        avatar: string;
    };
    onSubmit: (data: PostCreateInput) => void;
    isPending?: boolean;
}

const PostCreateForm = ({ user, onSubmit, isPending }: PostCreateFormProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [media, setMedia] = React.useState<File[] | null>(null);
    const form = useForm({
        resolver: zodResolver(PostCreateSchema),
        mode: "onChange",
        defaultValues: {
            content: "",
        },
    });

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setMedia((prev) => [...(prev || []), ...Array.from(files)]);
            form.setValue("media", files[0]);
        }
    }

    return (
        <form id="post-create-form" onSubmit={form.handleSubmit((data) => onSubmit(data))} className=''>
            <FieldGroup className='h-full flex flex-col justify-between'>
                <div className="flex flex-col h-full justify-between">
                    <Controller
                        name="content"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className='scrollbar-none max-h-100 mb-4'>
                                <Textarea
                                    {...field}
                                    id="post-create-form-content"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="What's new?"
                                    autoComplete="off"
                                    autoFocus
                                    className='border-none focus:outline-none focus-visible:ring-0 focus:ring-transparent bg-transparent resize-none md:scrollbar-none'
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    {media?.length === 0 ? null : (
                        <div className="grid grid-cols-1 gap-2 max-w-full">
                            <AttachmentGroup className="w-full">
                                {media?.map((image) => (
                                    <Attachment key={image.name} orientation="vertical" state="done">
                                        <AttachmentMedia variant="image">
                                            <img src={URL.createObjectURL(image)} alt={image.name} />
                                        </AttachmentMedia>
                                        <AttachmentContent>
                                            <AttachmentTitle>{image.name}</AttachmentTitle>
                                            <AttachmentDescription>{(image.size / 1024 / 1024).toFixed(2)} MB</AttachmentDescription>
                                        </AttachmentContent>
                                        <AttachmentActions>
                                            <AttachmentAction aria-label={`Remove ${image.name}`} onClick={() => {
                                                const updatedMedia = media.filter((_item, index) => index !== media.indexOf(image));
                                                setMedia(updatedMedia);
                                            }}>
                                                <XIcon />
                                            </AttachmentAction>
                                        </AttachmentActions>
                                        <AttachmentTrigger render={<a
                                            href={URL.createObjectURL(image)}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`Open ${image.name}`}
                                        />} />
                                    </Attachment>
                                ))}
                            </AttachmentGroup>
                        </div>
                    )}
                    <Controller
                        name='media'
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className='w-fit'>
                                <label
                                    htmlFor="post-create-form-media"
                                    className="cursor-pointer"
                                >
                                    <div className="size-10 overflow-hidden rounded-md relative border">
                                        <div className="flex size-full items-center justify-center text-2xl font-medium">
                                            <HugeiconsIcon icon={Image03Icon} className="size-5" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                        </div>
                                    </div>
                                </label>
                                <Input
                                    ref={inputRef}
                                    name={field.name}
                                    id="post-create-form-media"
                                    type="file"
                                    accept='image/*'
                                    className='hidden'
                                    aria-invalid={fieldState.invalid}
                                    onChange={handleMediaUpload}
                                    multiple
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
            </FieldGroup>
            {/* <Button ref={submitButtonRef} type="submit" disabled={isPending || !form.formState.isDirty}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button> */}
        </form>
    )
}

export default PostCreateForm