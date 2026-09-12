import { queryClient } from "@/config/query-client";
import { useConnections } from "@/features/activities/hooks/activity.hook";
import { Button } from "design/components/ui/button";
import { Spinner } from "design/components/ui/spinner";
import { useCallback } from "react";
import AppAlertDialog from "@/shared/components/alert";
import React from "react";

type Props = {
    userId: string;
    username: string;
    followStatus: string;
    isFollowing?: boolean;
};

const ToggleFollowButton = ({ userId, username, followStatus }: Props) => {
    const [unfollowAlertOpen, setUnfollowAlertOpen] = React.useState(false);
    const { toggleFollow } = useConnections();
    const { mutateAsync: followUser, isPending: isFollowPending } =
        toggleFollow(userId);

    const handleFollow = useCallback(() => {
        if (followStatus === "accepted") {
            setUnfollowAlertOpen(true);
            return;
        }
        followUser(undefined, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["followers", userId] });
                queryClient.invalidateQueries({ queryKey: ["users", username] });
                queryClient.invalidateQueries({ queryKey: ["following", userId] });
            },
            onError: (error) => {
                console.log(error?.message);
            },
        });
    }, [userId, username, followUser]);

    const renderFollowLabel = () => {
        if (followStatus === "accepted") {
            return "Following";
        } else if (followStatus === "pending") {
            return "Requested";
        }
        return "Follow";
    };

    return (
        <>
            <Button
                variant={
                    followStatus === "accepted"
                        ? "ghost"
                        : followStatus === "pending"
                            ? "secondary"
                            : "default"
                }
                className="w-1/2 rounded-full"
                onClick={handleFollow}
                size="lg"
            >
                {isFollowPending ? <Spinner /> : renderFollowLabel()}
            </Button>
            <AppAlertDialog
                open={unfollowAlertOpen}
                onOpenChange={setUnfollowAlertOpen}
                title={`Unfollow @${username}?`}
                description={``}
                variant="destructive"
                cancelText="Cancel"
                confirmText="Unfollow"
                onConfirm={() => {
                    followUser(undefined, {
                        onSuccess: () => {
                            setUnfollowAlertOpen(false);
                            queryClient.invalidateQueries({ queryKey: ["followers", userId] });
                            queryClient.invalidateQueries({ queryKey: ["users", username] });
                            queryClient.invalidateQueries({ queryKey: ["following", userId] });
                        },
                        onError: (error) => {
                            console.log(error?.message);
                        },
                    });
                }}
            />
        </>
    );
};

export default ToggleFollowButton;
