import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useMembers } from "@/features/club/hooks/membership.hooks";
import MemberCard from "@/features/club/components/club/member-card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "design/components/ui/avatar"
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { UsersRoundIcon } from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "design/components/ui/table"
import { getTimeAgo } from "@/utils/format-date";

const ClubMembersPage = () => {
  const { club } = useClubOutlet();
  const { data, isLoading } = useMembers(club?.id);

  if (!data && isLoading) {
    return <>Loading...</>
  }
  return (
    <div className="grid gap-3 grid-cols-1 px-4 min-h-0 overflow-y-auto">
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {/* <MemberCard
            key={member.id}
            member={member}
            showActions={club?.is_owner}
            variant="card"
          /> */}
      {data?.results?.members.length > 0 ? (
        data?.results?.members.map((member) => (
          <>
            <Table>
              <TableCaption>
                <span className="text-muted-foreground">Showing {data.count} members</span>
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Username</TableHead>
                  <TableHead>Member since</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Join method</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2.5">
                    <Avatar>
                      <AvatarImage src={member.profile_picture_url ?? undefined}></AvatarImage>
                      <AvatarFallback>{member.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {member.username}
                  </TableCell>
                  <TableCell>{getTimeAgo(member.joined_at)}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="text-muted-foreground">Unknown</TableCell>
                  <TableCell className="text-right">{member.primary_role_details?.name}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        ))
      ) : (
        <div className="w-full">
          <EmptyState title="No Members" description="No members joined yet" icon={<HugeiconsIcon icon={UsersRoundIcon} />} />
        </div>
      )}
      {/* </Table> */}
    </div>
  );
};

export default ClubMembersPage;
