import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useClubInvites } from "@/features/club/hooks/club.hooks";
import { useCallback, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "design/components/ui/table";
import { Button } from "design/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Cancel01Icon,
    Clock01Icon,
    Copy01Icon,
    CopyIcon,
    LoadingIcon,
    MoreVerticalIcon,
    Pause,
    Remove,
    ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "design/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuGroup,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "design/components/ui/dropdown-menu";
import { toast } from "design/components/ui/toast";
import EmptyState from "@/shared/components/empty-state";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import { Input } from "design/components/ui/input";
import { InviteCountdown } from "@/features/club/components/club/invite-countdown";
import type { AppError } from "@/settings/app/error";
import type { APIError } from "@/shared/types/response";
import { useIsMobile } from "design/hooks/use-mobile";
import { Card, CardContent, CardFooter } from "design/components/ui/card";

const Invites = () => {
    const isMobile = useIsMobile();
    const { club } = useClubOutlet();
    const canAccess =
        club?.me_permissions?.includes("manage_members") || club?.is_owner;
    const { invites, createInvite, removeInvite } = useClubInvites(
        club.id,
        canAccess,
    );
    const [creating, setCreating] = useState(false);
    const [activeInvite, setActiveInvite] = useState<any>();

    useEffect(() => {
        setActiveInvite(
            invites?.data?.results.findLast((invite: any) => !invite.is_expired),
        );
    }, [invites]);

    if (!canAccess) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center">
                <EmptyState
                    title="Restricted Access"
                    description="You don't have permission to view invites"
                    icon={<HugeiconsIcon icon={ViewOffSlashIcon} />}
                />
            </div>
        );
    }

    const handleCopy = (link: string) => {
        navigator.clipboard.writeText(link);
        toast.add({
            title: "Copied",
            timeout: 2000,
        });
    };

    const handleCreateInvite = useCallback((generateNew?: boolean) => {
        if (!generateNew && activeInvite) {
            setCreating(true);
            return;
        }

        setCreating(true);
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
                });
                setCreating(false);
            },
        });
    }, []);

    if (invites.isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <HugeiconsIcon icon={LoadingIcon} className="animate-spin" size={24} />
            </div>
        );
    }

    if (isMobile) {

        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    className={"rounded-full px-4"}
                    disabled={createInvite.isPending}
                >
                    {createInvite.isPending ? (
                        <HugeiconsIcon
                            icon={LoadingIcon}
                            className="animate-spin"
                            size={24}
                        />
                    ) : (
                        <HugeiconsIcon icon={Pause} />
                    )}
                    Pause Invites
                </Button>
                {invites.data?.results.map((invite: any) => (
                    <Card key={invite.id} className="bg-background m-1">
                        <CardContent className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p>{invite.code}</p>
                                {club.is_owner && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button size="icon-sm" className={""} variant="outline">
                                                <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className={'w-50'}>
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => handleCopy(invite.link)}>
                                                    <HugeiconsIcon icon={CopyIcon} className="size-4" />
                                                    <DropdownMenuLabel>Copy</DropdownMenuLabel>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem variant="destructive" onClick={() => removeInvite.mutate(invite.id)}>
                                                    <HugeiconsIcon icon={Remove} className="size-4" />
                                                    <DropdownMenuLabel>Revoke</DropdownMenuLabel>
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={Clock01Icon} className="size-4" />
                                <p className="text-xs text-muted-foreground font-medium">
                                    Expires in: <InviteCountdown expiresAt={invite.expires_at} />
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="w-full flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar size="default">
                                    <AvatarImage src={invite.created_by.avatar ?? undefined} />
                                    <AvatarFallback>
                                        {invite.created_by.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium">
                                    {invite.created_by.username}
                                </p>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Uses: {invite.uses}
                            </p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div>
            {invites?.data?.results.length > 0 ? (
                <>
                    <div className="flex justify-end p-2 gap-2">
                        <Button
                            variant="destructive"
                            className={"rounded-full"}
                            disabled={createInvite.isPending}
                        >
                            {createInvite.isPending ? (
                                <HugeiconsIcon
                                    icon={LoadingIcon}
                                    className="animate-spin"
                                    size={24}
                                />
                            ) : (
                                <HugeiconsIcon icon={Pause} />
                            )}
                            Pause Invites
                        </Button>
                        <Button
                            onClick={() => handleCreateInvite()}
                            variant="outline"
                            className={"rounded-full"}
                            disabled={createInvite.isPending}
                        >
                            {createInvite.isPending ? (
                                <HugeiconsIcon
                                    icon={LoadingIcon}
                                    className="animate-spin"
                                    size={24}
                                />
                            ) : (
                                <HugeiconsIcon icon={Add01Icon} />
                            )}
                            Create Invite
                        </Button>
                    </div>
                    <Table className="">
                        <TableHeader>
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="">Inviter</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Uses</TableHead>
                                <TableHead className="text-right">Expires</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invites?.data?.results?.map((invite: any) => (
                                <TableRow key={invite.id} className="relative group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Avatar>
                                                <AvatarImage
                                                    src={invite.created_by.avatar ?? undefined}
                                                ></AvatarImage>
                                                <AvatarFallback>
                                                    {invite.created_by.username[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {invite.created_by.username}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">{invite.code}</TableCell>
                                    <TableCell>{invite.uses}</TableCell>
                                    <TableCell className="text-right">
                                        <InviteCountdown expiresAt={invite.expires_at} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="icon-lg"
                                            className={"p-0 m-0"}
                                            variant="ghost"
                                            onClick={() => {
                                                handleCopy(invite.link);
                                            }}
                                        >
                                            <HugeiconsIcon icon={Copy01Icon} />
                                        </Button>
                                    </TableCell>
                                    <Button
                                        size="icon-sm"
                                        onClick={() => {
                                            removeInvite.mutate(invite.code);
                                        }}
                                        className={
                                            "p-0 m-0 absolute -right-3 -top-2 rounded-full hidden group-hover:flex"
                                        }
                                        variant="ghost"
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} />
                                    </Button>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            ) : (
                <>
                    <EmptyState
                        title="No Invites"
                        description="Ongoing invites will appear here"
                    >
                        <Button
                            onClick={() => handleCreateInvite()}
                            variant="outline"
                            className={"rounded-full"}
                            disabled={createInvite.isPending}
                        >
                            {createInvite.isPending ? (
                                <HugeiconsIcon
                                    icon={LoadingIcon}
                                    className="animate-spin"
                                    size={24}
                                />
                            ) : (
                                <HugeiconsIcon icon={Add01Icon} />
                            )}
                            Create Invite
                        </Button>
                    </EmptyState>
                </>
            )}

            <ResponsiveDialog
                open={creating}
                onOpenChange={setCreating}
                title="Create Invite"
                description="Create a new invite"
            >
                <div className="flex items-center gap-2 w-full justify-between p-2">
                    <Input
                        type="text"
                        disabled
                        value={activeInvite?.link}
                        className="flex-1"
                    />
                    <Button
                        onClick={() => handleCopy(activeInvite?.link || "")}
                        disabled={createInvite.isPending}
                    >
                        {createInvite.isPending ? (
                            <HugeiconsIcon
                                icon={LoadingIcon}
                                className="animate-spin"
                                size={24}
                            />
                        ) : (
                            <HugeiconsIcon icon={Copy01Icon} />
                        )}
                    </Button>
                </div>
                <Button
                    className="w-full rounded-full"
                    size="lg"
                    variant="outline"
                    onClick={() => handleCreateInvite()}
                    disabled={createInvite.isPending}
                >
                    {createInvite.isPending ? (
                        <HugeiconsIcon
                            icon={LoadingIcon}
                            className="animate-spin"
                            size={24}
                        />
                    ) : (
                        <>Generate new link</>
                    )}
                </Button>
            </ResponsiveDialog>
        </div>
    );
};

export default Invites;
