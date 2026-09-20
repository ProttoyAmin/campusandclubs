import React from 'react'
import { Button } from 'design/components/ui/button';
import { ArrowUp02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from 'design/components/ui/input';

type SendMessageProps = {
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void
}

const SendMessage = ({ message, setMessage, sendMessage }: SendMessageProps) => {

    const handleSend = () => {
        sendMessage()
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="max-w-full flex gap-2 items-center relative">
            <Input autoFocus placeholder="Type your message..." className='h-12 rounded-full border-none bg-muted' value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} />
            {message && (
                <>
                    <Button
                        size="icon-lg"
                        variant="outline"
                        className="rounded-full animate-[slideInUp_0.3s_ease-out] absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={handleSend}
                    >
                        <HugeiconsIcon
                            icon={ArrowUp02Icon}
                            className="size-5"
                        />
                    </Button>
                </>
            )}
        </div>
    )
}

export default SendMessage