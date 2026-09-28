import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useMembers } from "@/features/club/hooks/membership.hooks";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "design/components/ui/avatar"
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreVerticalIcon, UsersRoundIcon } from "@hugeicons/core-free-icons";
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
import { Button } from "design/components/ui/button";

const ClubMembersPage = () => {
  const { club } = useClubOutlet();
  const { data, isLoading } = useMembers(club?.id);

  if (!data && isLoading) {
    return <>Loading...</>
  }

  if (data?.results?.members.length === 0) {
    return (
      <div className="w-full">
        <EmptyState title="No Members" description="No members joined yet" icon={<HugeiconsIcon icon={UsersRoundIcon} />} />
      </div>
    )
  }
  return (
    <div className="min-h-0 overflow-y-auto">
      <Table>
        <TableCaption>
          <span className="text-muted-foreground">Showing {data.count} members</span>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Username</TableHead>
            <TableHead>Member since</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Join method</TableHead>
            <TableHead className="text-right">Roles</TableHead>
          </TableRow>
        </TableHeader>
        {data?.results?.members.length > 0 ? (
          data?.results?.members.map((member) => (
            <>
              <TableBody>
                <TableRow className="">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={member.avatar ?? undefined}></AvatarImage>
                        <AvatarFallback>{member.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {member.username}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getTimeAgo(member.joined_at)}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="text-muted-foreground">Unknown</TableCell>
                  <TableCell className="text-right">{member.primary_role_details?.name}</TableCell>
                  <TableCell className="text-right p-0">
                    <Button size="icon-lg" className={'p-0 m-0'} variant="ghost">
                      <HugeiconsIcon icon={MoreVerticalIcon} />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </>
          ))
        ) : (
          <div className="w-full">
            <EmptyState title="No Members" description="No members joined yet" icon={<HugeiconsIcon icon={UsersRoundIcon} />} />
          </div>
        )}
      </Table>
      {/* </Table> */}
    </div>
  );
};

export default ClubMembersPage;
