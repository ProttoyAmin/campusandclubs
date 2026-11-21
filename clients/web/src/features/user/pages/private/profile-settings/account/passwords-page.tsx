import React from 'react'
import { usePageHeader } from "@/shared/hooks/use-page-header";
import NavigateButtons from '@/shared/components/navigate-buttons';
import type { ChangePasswordSchemaType } from 'validation/auth';
import ChangePassword from '@/features/auth/components/forms/change-password';
import { useAccount } from '@/features/user/hooks/user.hooks';
import { toast } from 'design/components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/settings/routes';
import { useUserOutlet } from '@/features/user/context/user-layout-context';
import ResponsiveDialog from '@/shared/components/responsive-dialog';
import ForgotPasswordForm from '@/features/auth/components/forms/forgot-password-form';
import { Button } from 'design/components/ui/button';

const PasswordsPage = () => {
    const [attemptForgotPassword, setAttemptForgotPassword] = React.useState(false);
    const [passwordEditing, setPasswordEditing] = React.useState(false);
    const { user } = useUserOutlet();
    const pageHeader = usePageHeader();
    const { passwordChange } = useAccount();
    const navigate = useNavigate()


    React.useEffect(() => {
        const id = pageHeader.push(
            <div className="flex items-center gap-4">
                <NavigateButtons
                    hideForward
                />
                <h1 className="text-lg font-semibold">Password & Security</h1>
            </div>
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);

    const handleSubmit = React.useCallback((data: ChangePasswordSchemaType) => {
        console.log(data);

        passwordChange.mutate(data, {
            onSuccess: (data) => {
                console.log(data);
                // show success message
                toast.add({
                    type: "success",
                    description: "Password changed successfully",
                });
            },
            onError: (error) => {
                // show error message
                console.warn(error);
                toast.add({
                    type: "error",
                    description: error.response?.data?.errors?.[0]?.message,
                });
            },
        });

        // if (!passwordChange.isPending) {
        //     navigate(paths.public.auth.signIn, {
        //         replace: true
        //     })
        // }

    }, [passwordChange]);

    const handleSendCode = React.useCallback((email: string) => {
        console.log('sending code', email);
    }, [])


    return (
        <>
            <ResponsiveDialog
                open={attemptForgotPassword}
                onOpenChange={() => setAttemptForgotPassword(false)}
            >
                <ForgotPasswordForm
                    pending={passwordChange.isPending}
                    serverErrors={passwordChange.error?.response?.data || null}
                    onSubmit={handleSendCode}
                />
            </ResponsiveDialog>
            <ResponsiveDialog
                showCloseButton={false}
                open={passwordEditing}
                onOpenChange={() => setPasswordEditing(false)}
            >
                <div className="flex flex-col gap-4">
                    <div className='space-y-1 mb-4'>
                        <h2 className="text-lg font-semibold">Update your password</h2>
                    <p className="text-sm text-muted-foreground">Enter your current password and a new password. You will be logged out and required to sign in again.</p>
                    </div>
                    <ChangePassword
                        pending={passwordChange.isPending}
                        serverErrors={passwordChange.error?.response?.data || null}
                        onSubmit={handleSubmit}
                    />
                    <Button
                        className="w-fit mx-auto"
                        variant="link"
                        onClick={() => setAttemptForgotPassword(true)}
                    >
                        Forgot your password
                    </Button>
                </div>
            </ResponsiveDialog>
            <div className="flex gap-1 w-full justify-between items-center mb-6">
                <h2 className="text-md">Password</h2>
                <Button onClick={() => setPasswordEditing(true)} variant='outline' size='lg' className={'px-6'}>Edit</Button>
            </div>
            <div className="flex gap-1 w-full justify-between items-center mb-6">
                <h2 className="text-md flex flex-col items-start">Disable your account <span className='text-sm text-muted-foreground'>Temporarily disable your account.</span></h2>
                <Button variant='outline' size='lg' className={'px-6 text-destructive'}>Disable</Button>
            </div>
            <div className="flex gap-1 w-full justify-between items-center">
                <h2 className="text-md flex flex-col items-start">Close your account <span className='text-sm text-muted-foreground'>Permanently close your account.</span></h2>
                <Button variant='destructive' size='lg' className={'px-6'}>Delete account</Button>
            </div>
        </>
    )
}

export default PasswordsPage