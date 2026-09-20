import React from 'react'
import { Textarea } from 'design/components/ui/textarea'
import { Button } from 'design/components/ui/button';
import { ArrowUp02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

type SendMessageProps = {
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void
}

const SendMessage = ({ message, setMessage, sendMessage }: SendMessageProps) => {

    const handleSend = () => {
        sendMessage()
    };

    return (
        <div className="max-w-full flex gap-2 items-center relative">
            <Textarea autoFocus placeholder="Type your message..." className='resize-none' value={message} onChange={(e) => setMessage(e.target.value)} />
            {message && (
                <>
                    <Button
                        size="icon-lg"
                        variant="outline"
                        className="rounded-full animate-[slideInUp_0.3s_ease-out] absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => handleSend()}
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