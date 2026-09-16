import { useQuery } from "@tanstack/react-query";
import { interactionService } from "../services/interactions.service";

export const useComment = (commentId: string, options?: { enabled?: boolean }) => {
    const replies = useQuery({
        queryKey: ["comment", commentId, "replies"],
        queryFn: () => interactionService.commentReplies(commentId),
        enabled: options?.enabled ?? false,
    });

    return {
        replies
    }
};