import { useClubOutlet } from '@/features/club/context/club-layout-context';
import { useClubInvites } from '@/features/club/hooks/club.hooks';
import React, { useCallback, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "design/components/ui/table"
import { Button } from 'design/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Cancel01Icon, Copy01Icon, LoadingIcon, MoreVerticalIcon, Pause } from '@hugeicons/core-free-icons';
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "design/components/ui/avatar"
import { toast } from 'design/components/ui/toast';
import EmptyState from '@/shared/components/empty-state';
import { useState } from 'react';
import ResponsiveDialog from '@/shared/components/responsive-dialog';
import { Input } from 'design/components/ui/input';
import { InviteCountdown } from '@/features/club/components/club/invite-countdown';
import type { AppError } from '@/settings/app/error';
import type { APIError } from '@/shared/types/response';
import type { InviteResponse } from '@/features/club/http/club.http';

const Invites = () => {
    const { club } = useClubOutlet();
    const { invites, createInvite, removeInvite } = useClubInvites(club.id);
    const [creating, setCreating] = useState(false);
    const [activeInvite, setActiveInvite] = useState<any>();

    useEffect(() => {
        setActiveInvite(invites?.data?.results.findLast((invite: any) => !invite.is_expired))
    }, [invites])


    const handleCopy = (link: string) => {
        navigator.clipboard.writeText(link)
        toast.add({
            title: "Copied",
            description: link,
            timeout: 2000,
        })
    }

    const handleCreateInvite = useCallback((generateNew?: boolean) => {
        if (!generateNew && activeInvite) {
            setCreating(true)
            return
        }

        setCreating(true)
        createInvite.mutate(undefined, {
            onSuccess: () => {
                // pass for now
            },
            onError: (error: AppError<APIError>) => {
                toast.add({
                    title: "Error",
                    description: error.response.data.detail,
                    type: "error",
                    timeout: 2000,
                })
                setCreating(false)
            }
        })
    }, [])

    if (invites.isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <HugeiconsIcon icon={LoadingIcon} className="animate-spin" size={24} />
            </div>
        )
    }

    return (
        <div>
            {
                invites?.data?.results.length > 0 ? (
                    <>
                        <div className='flex justify-end p-2 gap-2'>
                            <Button variant='destructive' className={'rounded-full'} disabled={createInvite.isPending}>
                                {createInvite.isPending ? (
                                    <HugeiconsIcon icon={LoadingIcon} className="animate-spin" size={24} />
                                ) : (
                                    <HugeiconsIcon icon={Pause} />
                                )}
                                Pause Invites
                            </Button>
                            <Button onClick={() => handleCreateInvite()} variant='outline' className={'rounded-full'} disabled={createInvite.isPending}>
                                {createInvite.isPending ? (
                                    <HugeiconsIcon icon={LoadingIcon} className="animate-spin" size={24} />
                                ) : (
                                    <HugeiconsIcon icon={Add01Icon} />
                                )}
                                Create Invite
                            </Button>
                        </div>
                        <Table className=''>
                            <TableHeader>
                                <TableRow className='border-none hover:bg-transparent'>
                                    <TableHead className="">Inviter</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Uses</TableHead>
                                    <TableHead className="text-right">Expires</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invites?.data?.results?.map((invite: any) => (
                                    <TableRow key={invite.id} className='relative group'>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Avatar>
                                                    <AvatarImage src={invite.created_by.avatar ?? undefined}></AvatarImage>
                                                    <AvatarFallback>{invite.created_by.username[0].toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                {invite.created_by.username}
                                            </div>
                                        </TableCell>
                                        <TableCell className='font-mono'>{invite.code}</TableCell>
                                        <TableCell>{invite.uses}</TableCell>
                                        <TableCell className="text-right"><InviteCountdown expiresAt={invite.expires_at} /></TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon-lg" className={'p-0 m-0'} variant="ghost" onClick={() => {
                                                handleCopy(invite.link)
                                            }}>
                                                <HugeiconsIcon icon={Copy01Icon} />
                                            </Button>
                                        </TableCell>
                                        <Button size="icon-sm" onClick={() => {
                                            removeInvite.mutate(invite.code)
                                        }} className={'p-0 m-0 absolute -right-3 -top-2 rounded-full hidden group-hover:flex'} variant="ghost">
                                            <HugeiconsIcon icon={Cancel01Icon} />
                                        </Button>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                ) : (
                    <>
                        <EmptyState title='No Invites' description='Ongoing invites will appear here'>
                            <Button onClick={() => handleCreateInvite()} variant='outline' className={'rounded-full'} disabled={createInvite.isPending}>
                                {createInvite.isPending ? (
                                    <HugeiconsIcon icon={LoadingIcon} className="animate-spin" size={24} />
                                ) : (
                                    <HugeiconsIcon icon={Add01Icon} />
                                )}
                                Create Invite
                            </Button>
                        </EmptyState>
                    </>
                )
            }

            <ResponsiveDialog
                open={creating}
                onOpenChange={setCreating}
                title='Create Invite'
                description='Create a new invite'
            >
                <div className='flex items-center gap-2 w-full justify-between p-2'>
                    <Input
                        type="text"
                        disabled
                        value={activeInvite?.link}
                        className="flex-1"
                    />
                    <Button onClick={() => handleCopy(activeInvite?.link || "")} disabled={createInvite.isPending} >
                        {createInvite.isPending ? (
                            <HugeiconsIcon icon={LoadingIcon} className="animate-spin" size={24} />
                        ) : (
                            <HugeiconsIcon icon={Copy01Icon} />
                        )}
                    </Button>
                </div>
                <Button className="w-full rounded-full" size='lg' variant="outline" onClick={() => handleCreateInvite()} disabled={createInvite.isPending} >
                    {createInvite.isPending ? (
                        <HugeiconsIcon icon={LoadingIcon} className="animate-spin" size={24} />
                    ) : (
                        <>Generate new link</>
                    )}
                </Button>
            </ResponsiveDialog>

        </div>
    )
}

export default Invites