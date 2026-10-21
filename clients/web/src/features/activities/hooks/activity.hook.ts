import { useQuery, useMutation } from "@tanstack/react-query";
import { activityService } from "../services/activity.service";

export const useConnections = () => {
  const listFollowers = (userId: string) =>
    useQuery({
      queryKey: ["followers", userId],
      queryFn: () => activityService.getFollowers(userId),
    });

  const listFollowing = (userId: string) =>
    useQuery({
      queryKey: ["following", userId],
      queryFn: () => activityService.getFollowing(userId),
    });

  const listRequests = () =>
    useQuery({
      queryKey: ["requests"],
      queryFn: () => activityService.getRequests(),
    });

  const listBlockedUsers = () =>
    useQuery({
      queryKey: ["blocked"],
      queryFn: () => activityService.getBlockedUsers(),
    });

  const toggleFollow = (userId: string) =>
    useMutation({
      mutationFn: () => activityService.toggleFollow(userId),
    });

  const removeFollower = (userId: string) =>
    useMutation({
      mutationFn: () => activityService.removeFollower(userId),
    });

  const acceptRequest = (userId: string) =>
    useMutation({
      mutationFn: () => activityService.acceptRequest(userId),
    });

  const rejectRequest = (userId: string) =>
    useMutation({
      mutationFn: () => activityService.rejectRequest(userId),
    });

  const blockUser = (userId: string) =>
    useMutation({
      mutationFn: () => activityService.blockUser(userId),
    });

  const unblockUser = (userId: string) =>
    useMutation({
      mutationFn: () => activityService.unblockUser(userId),
    });

  return {
    listFollowers,
    listFollowing,
    listRequests,
    listBlockedUsers,
    toggleFollow,
    removeFollower,
    acceptRequest,
    rejectRequest,
    blockUser,
    unblockUser,
  };
};
