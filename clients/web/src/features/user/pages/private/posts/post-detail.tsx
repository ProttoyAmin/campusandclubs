import { useParams } from 'react-router-dom';
import { usePost } from '@/features/posts/hooks/posts.hooks';
import PostCard from '@/features/posts/components/post-card';
import { useMe } from '@/features/user/hooks/user.hooks';
import CommentBoxForm from '@/features/posts/components/forms/comment-box-form';
import CommentCard from '@/features/posts/components/comment-card';
import type { Comment } from '@/types/comment';
import EmptyState from '@/shared/components/empty-state';

const PostDetail = () => {
    const { postId } = useParams();
    const { retrieve, comments } = usePost(postId as string);
    const { data: currentUser } = useMe();

    const onComment = (data: {
        content: string, parent: string | null
    }) => {
        console.log(data)
    }

    return (
        <>
            {retrieve.data ? (
                <>
                    <div className="flex flex-col gap-6">
                        <PostCard post={retrieve.data} enableNavigate={false} />
                        <div className="px-4">
                            <CommentBoxForm user={currentUser} post={retrieve.data} onComment={onComment} />
                        </div>
                        <div className="px-4">
                            {comments?.data?.results?.length ? (
                                <>
                                    {
                                        comments.data?.results?.map((comment: Comment) => (
                                            <CommentCard key={comment.id} comment={comment} />
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