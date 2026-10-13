import React from "react";
import { Button } from "design/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SendIcon } from "@hugeicons/core-free-icons";
import type { PostExtended } from "@/features/posts/components/post-card";
import ResponsiveDialog from "@/shared/components/responsive-dialog";

const SendDirectPost = ({ post }: { post: PostExtended }) => {
    const [attemptSendPost, setAttemptSendPost] = React.useState(false);
    const [sendCount, setSendCount] = React.useState(post.share_count);

    return (
        <ResponsiveDialog
            size="md"
            trigger={
                <Button
                    variant={"ghost"}
                    size={"lg"}
                    className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50"
                    onClick={() => setAttemptSendPost(true)}
                >
                    <HugeiconsIcon icon={SendIcon} className="size-5" />
                    <span className="text-xs text-muted-foreground">
                        {sendCount}
                    </span>
                </Button>
            }
            open={attemptSendPost}
            onOpenChange={setAttemptSendPost}
            title={
                <div className="flex flex-row items-center gap-2 justify-center text-xl font-semibold border-b pb-2">
                    <span>Send</span>
                </div>
            }
            children={
                <>
                    <div className="flex flex-col gap-2 border">
                        Send poeple you know
                    </div>
                </>
            }
            footer={
                <div className="w-full gap-2 border">
                    <Button
                        variant={"outline"}
                        onClick={() => setAttemptSendPost(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={"default"}
                        onClick={() => setAttemptSendPost(false)}
                    >
                        Share
                    </Button>
                </div>
            }
        />
    );
};

export default SendDirectPost;
