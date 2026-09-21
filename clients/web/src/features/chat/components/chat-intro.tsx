import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "design/components/ui/avatar";
import { Button } from "design/components/ui/button";
import { Link } from "react-router-dom";
import { paths } from "@/settings/routes";
import type { ChatParticipant } from "../http/chat.http";

interface ChatIntroProps {
    participants: ChatParticipant[];
    isGroup: boolean;
}


const MAX_VISIBLE = 3;

const ChatIntro = ({ participants, isGroup }: ChatIntroProps) => {
    if (participants.length === 0) return null;

    if (!isGroup) {
        const user = participants[0]?.user;
        return (
            <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
                <Avatar size="2xl">
                    <AvatarImage src={user.avatar ?? undefined} />
                    <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{user.username}</p>
                <Button variant="glass" size="default" className={"rounded-full px-6"} render={<Link to={paths.private.user.profile(user.username)} />}>
                    View Profile
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
            <AvatarGroup>
                {participants.slice(0, MAX_VISIBLE).map((user) => (
                    <Avatar key={user.id} size="2xl">
                        <AvatarImage src={user.user.avatar ?? undefined} />
                        <AvatarFallback>{user.user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                ))}
                {participants.length > MAX_VISIBLE && (
                    <AvatarGroupCount>+{participants.length - MAX_VISIBLE}</AvatarGroupCount>
                )}
            </AvatarGroup>
            <p className="font-semibold">{participants.map((u) => u.user.username).join(", ")}</p>
            <Button variant="glass" size="default" className={"rounded-full px-6"}>
                View Members
            </Button>
        </div>
    );
};

export default ChatIntro;