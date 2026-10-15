import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "design/components/ui/card";
import { Button } from 'design/components/ui/button';
import { useInvite } from '../../hooks/club.hooks';
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "design/components/ui/avatar"
import { paths } from '@/settings/routes';
import React from 'react';
import { Spinner } from 'design/components/ui/spinner';

const InviteClubHeader = ({ data }: { data: { club: { avatar?: string; name: string }; created_by: { avatar?: string; username: string } } }) => (
    <div className="flex flex-col items-center gap-4 py-2">
        <Avatar className="h-16 w-16">
            <AvatarImage src={data.club.avatar ?? undefined} />
            <AvatarFallback className="text-xl font-semibold">
                {data.club.name[0].toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold">{data.club.name}</h2>
            <p className="text-sm text-muted-foreground">
                Invited by
            </p>
            <div className="flex items-center justify-center gap-2">
                <Avatar className="h-5 w-5">
                    <AvatarImage src={data.created_by.avatar ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                        {data.created_by.username[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{data.created_by.username}</span>
            </div>
        </div>
    </div>
);

const LoginCard = ({ data, detail }: { data: any; detail: string }) => {
    const navigate = useNavigate();

    return (
        <Card className="max-w-md mx-auto w-full bg-background border">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">You're Invited!</CardTitle>
                <CardDescription>{detail}</CardDescription>
            </CardHeader>
            <CardContent>
                <InviteClubHeader data={data} />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    className="w-full rounded-full"
                    size='lg'
                    variant="outline"
                    onClick={() => {
                        console.log('Navigate to sign in');
                        navigate(paths.public.auth.signIn);
                    }}
                >
                    Sign In
                </Button>
                <Button
                    variant="ghost"
                    className="w-full rounded-full"
                    size='lg'
                    onClick={() => {
                        console.log('Dismiss');
                        navigate('/');
                    }}
                >
                    Dismiss
                </Button>
            </CardFooter>
        </Card>
    );
};

const AlreadyJoinedCard = ({ data, detail }: { data: any; detail: string }) => {
    const navigate = useNavigate();

    return (
        <Card className="max-w-md mx-auto w-full bg-background border">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Already a Member</CardTitle>
                <CardDescription>{detail}</CardDescription>
            </CardHeader>
            <CardContent>
                <InviteClubHeader data={data} />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    variant="outline"
                    className="w-full rounded-full"
                    size='lg'
                    onClick={() => {
                        console.log('Go to club', data.club.slug);
                        navigate(paths.public.club.slug(data.club.slug));
                    }}
                >
                    Visit
                </Button>
                <Button
                    variant="ghost"
                    className="w-full rounded-full"
                    size='lg'
                    onClick={() => {
                        console.log('Dismiss');
                        navigate('/');
                    }}
                >
                    Dismiss
                </Button>
            </CardFooter>
        </Card>
    );
};

const AcceptCard = ({ data, detail, inviteCode, onAccept, isPending }: { data: any; detail: string; inviteCode: string, onAccept: () => void, isPending: boolean }) => {
    const navigate = useNavigate();

    return (
        <Card className="max-w-md mx-auto w-full bg-background border">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">You're Invited!</CardTitle>
                <CardDescription>{detail}</CardDescription>
            </CardHeader>
            <CardContent>
                <InviteClubHeader data={data} />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    className="w-full rounded-full"
                    variant="outline"
                    size='lg'
                    onClick={onAccept}
                    disabled={isPending}
                >
                    {isPending ? <><Spinner className='size-4 mr-2' /> Accepting...</> : 'Accept'}
                </Button>
                <Button
                    variant="ghost"
                    className="w-full rounded-full"
                    size='lg'
                    disabled={isPending}
                    onClick={() => {
                        console.log('Dismiss');
                        navigate('/');
                    }}
                >
                    Dismiss
                </Button>
            </CardFooter>
        </Card>
    );
};

const AcceptInvitationPage = () => {
    const { invite_code } = useParams()
    const navigate = useNavigate();
    const { getInvite, acceptInvite } = useInvite(invite_code!);
    const accept = acceptInvite(getInvite.data?.data.club.id);

    React.useEffect(() => {
        document.title = `Invitation to join ${getInvite.data?.data.club?.name} club | campusandclubs`
    }, [getInvite.data?.data.club?.name])

    if (getInvite.isLoading) {
        return (
            <div className="min-h-dvh w-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading invitation...</p>
            </div>
        );
    }

    const handleAccept = () => {
        console.log('Accept invite', invite_code, 'for club', getInvite.data?.data.club.id);

        accept.mutate(invite_code!, {
            onSuccess: () => {
                navigate(paths.public.club.slug(getInvite.data?.data.club.slug));
            }
        })
    }

    if (getInvite.isError) {
        return (
            <div className="min-h-dvh w-full flex items-center justify-center">
                <Card className="max-w-md mx-auto w-full bg-background border">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Invalid Invitation</CardTitle>
                        <CardDescription>
                            This invitation link is invalid, expired, or has been revoked.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                                console.log('Dismiss');
                                window.location.href = '/';
                            }}
                        >
                            Go Home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const { action, detail, data } = getInvite.data!;

    const renderContent = () => {
        switch (action) {
            case 'login':
                return <LoginCard data={data} detail={detail} />;
            case 'already_joined':
                return <AlreadyJoinedCard data={data} detail={detail} />;
            case 'accept':
                return <AcceptCard data={data} detail={detail} inviteCode={invite_code!} onAccept={handleAccept} isPending={accept.isPending} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-dvh w-full flex items-center justify-center p-4">
            {renderContent()}
        </div>
    )
}

export default AcceptInvitationPage