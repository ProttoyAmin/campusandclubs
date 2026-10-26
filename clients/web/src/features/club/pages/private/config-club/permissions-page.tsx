import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "design/components/ui/table"
import { useClubOutlet } from '@/features/club/context/club-layout-context';
import { useClubInfo } from '@/features/club/hooks/club.hooks';
import { Button } from 'design/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit04Icon, MoreVerticalIcon, ShieldUserIcon, UserRoundIcon } from '@hugeicons/core-free-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "design/components/ui/tooltip";
import { Spinner } from 'design/components/ui/spinner';
import { Badge } from 'design/components/ui/badge';
import { useIsMobile } from "design/hooks/use-mobile";

const ClubPermissionsPage = () => {
  const isMobile = useIsMobile();
  const { club } = useClubOutlet()
  const { getRoles } = useClubInfo(club.slug);
  const roleData = getRoles(club.id);

  if (roleData.isLoading || roleData.isPending) {
    return <div className='flex justify-center items-center h-full'><Spinner /></div>
  }

  if (isMobile) {
    return (
      <>
        TODO
      </>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Roles</h1>
      <p>Use roles to group your club and assign permissions.</p>
      <Table>
        <TableHeader>
          <TableHead>Roles</TableHead>
          <TableHead colSpan={2}>Members</TableHead>
        </TableHeader>
        <TableBody>
          {roleData.data?.roles?.map((role: any) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Badge variant="outline">
                    <div className="size-2 rounded-full" style={{ backgroundColor: role.color }}></div>
                    {role.name}</Badge>
                </div>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <HugeiconsIcon icon={UserRoundIcon} className="size-5" />
                      {role.user_count}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View members</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              {club.is_owner && (
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button size="icon-lg" className={'p-0 m-0'} variant="ghost">
                        <HugeiconsIcon icon={Edit04Icon} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage Role</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ClubPermissionsPage