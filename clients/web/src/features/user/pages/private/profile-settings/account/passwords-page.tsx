import React from 'react'
import { usePageHeader } from "@/shared/hooks/use-page-header";
import NavigateButtons from '@/shared/components/navigate-buttons';
import { CardContent } from 'design/components/ui/card';
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
    const { user } = useUserOutlet();
    const pageHeader = usePageHeader();
    const { passwordChange } = useAccount();
    const navigate = useNavigate()


    React.useEffect(() => {
        const id = pageHeader.push(
            <>
                <div className="flex items-center gap-4">
                    <NavigateButtons
                        hideForward
                    />
                    <h1 className="text-lg font-semibold">Passwords</h1>
                </div>
            </>
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);

    const handleSubmit = React.useCallback((data: ChangePasswordSchemaType) => {
        console.log(data);

        passwordChange.mutate(data, {
            onSuccess: () => {
                // show success message
                toast.add({
                    type: "success",
                    description: "Password changed successfully",
                });
            },
            onError: (error) => {
                // show error message
                console.log(error);
                toast.add({
                    type: "error",
                    description: error.response?.data?.errors?.[0]?.message,
                });
            },
        });

        if (!passwordChange.isPending) {
            navigate(paths.public.auth.signIn, {
                replace: true
            })
        }

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
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold">Passwords</h2>
                    <p className="text-muted-foreground text-sm">Change your password anytime</p>
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
            </CardContent>
        </>
    )
}

export default PasswordsPage