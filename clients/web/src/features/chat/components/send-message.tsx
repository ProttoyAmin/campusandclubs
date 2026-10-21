import React from 'react'
import { Button } from 'design/components/ui/button';
import { Cancel01Icon, PlusIcon, SendHorizontalIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from 'design/components/ui/input';
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTrigger,
} from "design/components/ui/attachment";


type SendMessageProps = {
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    onKeystroke: () => void;
}

const SendMessage = ({ message, setMessage, sendMessage, onKeystroke }: SendMessageProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [media, setMedia] = React.useState<File[] | null>(null);

    const handleSend = React.useCallback(() => {
        sendMessage()
        console.log(media);
        setMedia(null)
    }, [sendMessage, media, setMedia])

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage])

    const handleMediaUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setMedia((prev) => [...(prev || []), ...Array.from(files)]);
        }
    }, [setMedia])

    const removeMedia = React.useCallback((index: number) => {
        setMedia((prev) => prev?.filter((_, i) => i !== index))
    }, [setMedia])

    return (
        <div className="max-w-full flex flex-col">
            {media && media.length > 0 && (
                <div className="grid grid-cols-1 gap-2 max-w-full mb-1.5 md:mb-2.5">
                    <AttachmentGroup className="w-full">
                        {media?.map((m) => (
                            <Attachment
                                key={m.name}
                                orientation="vertical"
                                state="done"
                            >
                                <AttachmentMedia variant={"image"}>
                                    {m.type.startsWith("video/") ? (
                                        <video src={URL.createObjectURL(m)} />
                                    ) : (
                                        <img src={URL.createObjectURL(m)} alt={m.name} />
                                    )}
                                </AttachmentMedia>
                                <AttachmentActions className='bg-background rounded-full'>
                                    <AttachmentAction
                                        aria-label={`Remove ${m.name}`}
                                        onClick={() => removeMedia(media.indexOf(m))}
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} />
                                    </AttachmentAction>
                                </AttachmentActions>
                                <AttachmentTrigger
                                    render={
                                        <a
                                            href={URL.createObjectURL(m)}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`Open ${m.name}`}
                                        />
                                    }
                                />
                            </Attachment>
                        ))}
                    </AttachmentGroup>
                </div>
            )}
            <div className='w-full relative flex gap-2 items-center'>
                <Button size="lg" variant="outline" className="rounded-md size-11 border-none relative">
                    <HugeiconsIcon icon={PlusIcon} className="size-5" />
                    <Input
                        ref={inputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleMediaUpload}
                        multiple
                    />
                </Button>
                <Input
                    autoFocus
                    autoComplete="off"
                    placeholder="Type your message..."
                    className="h-11 border-none"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value)
                        onKeystroke()
                    }}
                    onKeyDown={handleKeyDown}
                />
                {(message || media?.length > 0) && (
                    <>
                        <Button
                            size="icon-sm"
                            variant="default"
                            className="animate-[slideInUp_0.3s_ease-out] absolute right-3 top-1/2 -translate-y-1/2"
                            onClick={handleSend}
                        >
                            <HugeiconsIcon
                                icon={SendHorizontalIcon}
                                className="size-4"
                            />
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

export default SendMessage