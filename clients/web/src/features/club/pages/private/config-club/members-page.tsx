import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useMembers } from "@/features/club/hooks/membership.hooks";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "design/components/ui/avatar"
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, MoreVerticalIcon, UsersRoundIcon } from "@hugeicons/core-free-icons";
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
import { Badge } from "design/components/ui/badge";
import { useIsMobile } from "design/hooks/use-mobile";
import React from "react";

const ClubMembersPage = () => {
  const isMobile = useIsMobile();
  const { club } = useClubOutlet();
  const { data, isLoading } = useMembers(club?.id);

  if (!data && isLoading) {
    return <>Loading...</>
  }

  if (!data && data?.results?.members.length === 0) {
    return (
      <div className="w-full">
        <EmptyState title="No Members" description="No members joined yet" icon={<HugeiconsIcon icon={UsersRoundIcon} />} />
      </div>
    )
  }

  if (isMobile) {
    const Avatar = React.lazy(() => import("design/components/ui/avatar").then((m) => ({ default: m.Avatar })))
    const AvatarImage = React.lazy(() => import("design/components/ui/avatar").then((m) => ({ default: m.AvatarImage })))
    const AvatarFallback = React.lazy(() => import("design/components/ui/avatar").then((m) => ({ default: m.AvatarFallback })))

    return (
      <>
        <div className='rounded-md border divide-y divide-border'>
          {data.results.members.map((member, index) => (
            <div key={member.id} className={`w-full flex justify-between items-center p-4 ${index !== data.results.members.length - 1 ? 'border-border/50 border-b' : ''}`}>
              <div className='flex items-center gap-2.5'>
                <React.Suspense fallback={<div className="size-8 rounded-full bg-muted animate-pulse"></div>}>
                  <Avatar className="size-8">
                    <AvatarImage src={member.avatar ?? undefined} />
                    <AvatarFallback>{member.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </React.Suspense>
                <div className=''>
                  <p className='font-semibold text-sm'>{member.username}</p>
                  <p className='text-muted-foreground text-xs'>{member.role_details.map((role) => role.name).join(', ')}</p>
                </div>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-0 overflow-y-auto">
      <Table>
        <TableCaption>
          <span className="text-muted-foreground">Showing {data.count} members</span>
        </TableCaption>
        <TableHeader>
          <TableHead className="w-25">Username</TableHead>
          <TableHead>Member since</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Join method</TableHead>
          <TableHead>Roles</TableHead>
        </TableHeader>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
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
                  <TableCell className="text-muted-foreground">{member.joined_method}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1">
                      {member.role_details.map((role) => (
                        <Badge variant="outline" className='rounded-sm flex items-center gap-1'>
                          <div className="size-2 rounded-full" style={{ backgroundColor: role.color }}></div>
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  {club.is_owner && (
                    <TableCell className="text-right p-0">
                      <Button size="icon-lg" className={'p-0 m-0'} variant="ghost">
                        <HugeiconsIcon icon={MoreVerticalIcon} />
                      </Button>
                    </TableCell>
                  )}
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
