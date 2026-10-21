import type { Post } from "@campus/api";
import React from "react";

const ClubPostsCard = ({ post }: { post: Post }) => {
    return (
        <>
            <h1 className="text-lg font-semibold">{post.author?.username}</h1>
            <p className="text-base">{post.content}</p>
            <div>
                <span>{post.created_at}</span>
            </div>
        </>
    );
};

export default ClubPostsCard;