import { useParams } from 'react-router-dom';
import { usePost } from '@/features/posts/hooks/posts.hooks';
import PostCard from '@/features/posts/components/post-card';
import { useMe } from '@/features/user/hooks/user.hooks';
import CommentBoxForm, { type CommentBoxFormHandle } from '@/features/posts/components/forms/comment-box-form';
import CommentCard from '@/features/posts/components/comment-card';
import type { Comment } from '@/types/comment';
import EmptyState from '@/shared/components/empty-state';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import React, { useEffect } from 'react';
import NavigateButtons from '@/shared/components/navigate-buttons';
import { useLocation, useNavigate } from 'react-router-dom';

const PostDetail = () => {
    const { postId } = useParams();
    const commentFormRef = React.useRef<CommentBoxFormHandle>(null);
    const { retrieve, comments, postComments } = usePost(postId as string);
    const pageHeader = usePageHeader();
    const { data: currentUser } = useMe();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (retrieve.data) {
            const id = pageHeader.push(
                <>
                    <div className="flex items-center gap-4">
                        <NavigateButtons hideForward />
                        <h1 className="text-lg font-semibold">Post</h1>
                    </div>
                </>);
            return () => pageHeader.pop(id)
        }
    }, [pageHeader.push, pageHeader.pop, retrieve.data, location.pathname, navigate])

    const onComment = (data: {
        content: string, parent: string | null
    }) => {
        postComments.mutate(data, {
            onSuccess: () => {

            }
        })
    }

    const onReply = (username: string, parentId: string) => {
        commentFormRef.current?.replyTo(username, parentId);
    };

    return (
        <>
            {retrieve.data ? (
                <>
                    <div className="flex flex-col gap-6">
                        <PostCard post={retrieve.data} enableNavigate={false} />
                        <div className="px-2 sticky bottom-10">
                            <CommentBoxForm ref={commentFormRef} user={currentUser} post={retrieve.data} onComment={onComment} />
                        </div>
                        <div className="px-4 space-y-4">
                            {comments?.data?.results?.length ? (
                                <>
                                    {
                                        comments.data?.results?.map((comment: Comment) => (
                                            <CommentCard key={comment.id} comment={comment} onReply={onReply} />
                                        ))
                                    }
                                </>
                            ) : (
                                <EmptyState
                                    title='No comments'
                                    description='Be the first one to comment'
                                />
                            )}
                        </div>
                    </div>
                </>
            ) : null}
        </>
    )
}

export default PostDetail