import React, { useRef, useState } from "react";
import { Button } from "design/components/ui/button";
import { ArrowUp02Icon, Attachment01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "design/components/ui/input";

type SendMessageProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (opts?: { files?: File[] }) => void;
  isSending?: boolean;
};

const SendMessage = ({ message, setMessage, sendMessage, isSending }: SendMessageProps) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleSend = () => {
    if (!message.trim() && pendingFiles.length === 0) return;
    sendMessage({ files: pendingFiles.length ? pendingFiles : undefined });
    setMessage("");
    setPendingFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPendingFiles(files);
  };

  return (
    <div className="max-w-full flex flex-col gap-2 relative">
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-1 px-2">
          {pendingFiles.map((f) => (
            <span key={f.name} className="text-xs bg-muted rounded-full px-2 py-0.5">
              📎 {f.name}
            </span>
          ))}
          <button
            type="button"
            className="text-xs text-destructive hover:underline"
            onClick={() => {
              setPendingFiles([]);
              if (fileRef.current) fileRef.current.value = "";
            }}
          >
            clear
          </button>
        </div>
      )}
      <div className="flex gap-2 items-center relative">
        <Button
          size="icon-lg"
          variant="ghost"
          className="rounded-full shrink-0"
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
        >
          <HugeiconsIcon icon={Attachment01Icon} className="size-5" />
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
          onChange={onFilesChosen}
        />
        <Input
          autoFocus
          placeholder="Type your message..."
          className="h-12 rounded-full border-none bg-muted pr-14"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        {(message.trim() || pendingFiles.length > 0) && (
          <Button
            size="icon-lg"
            variant="default"
            className="rounded-full absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleSend}
            disabled={isSending}
            type="button"
          >
            <HugeiconsIcon icon={ArrowUp02Icon} className="size-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SendMessage;
