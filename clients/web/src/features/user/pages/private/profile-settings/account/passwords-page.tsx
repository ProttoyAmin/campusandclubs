import React from 'react'
import { usePageHeader } from "@/shared/hooks/use-page-header";
import NavigateButtons from '@/shared/components/navigate-buttons';
import { CardContent } from 'design/components/ui/card';
import type { ChangePasswordSchemaType } from 'validation/auth';
import ChangePassword from '@/features/auth/components/forms/change-password';
import { useAccount } from '@/features/user/hooks/user.hooks';
import { toast } from 'design/components/ui/toast';

const PasswordsPage = () => {
    const pageHeader = usePageHeader();
    const { passwordChange } = useAccount();

    const handleSubmit = React.useCallback((data: ChangePasswordSchemaType) => {
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
                toast.add({
                    type: "error",
                    description: error.response.data.errors[0].message,
                });
            },
        });
    }, [passwordChange]);

    React.useEffect(() => {
        pageHeader.setActions(
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
            pageHeader.clearActions();
        };
    }, [
        pageHeader.setActions,
        pageHeader.clearActions,
    ]);
    return (
        <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Passwords</h2>
                <p className="text-muted-foreground text-sm">Change your password anytime</p>
            </div>
            <ChangePassword
                pending={passwordChange.isPending}
                serverErrors={passwordChange.error?.response.data || null}
                onSubmit={handleSubmit}
            />
        </CardContent>
    )
}

export default PasswordsPage