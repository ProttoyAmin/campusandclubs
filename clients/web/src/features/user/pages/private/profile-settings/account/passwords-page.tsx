import React from 'react'
import { usePageHeader } from "@/shared/hooks/use-page-header";
import NavigateButtons from '@/shared/components/navigate-buttons';
import ResetPasswordForm from '@/features/auth/components/forms/reset-password';
import { CardContent } from 'design/components/ui/card';

const PasswordsPage = () => {
    const pageHeader = usePageHeader();

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
            <ResetPasswordForm
                pending={false}
                serverErrors={null}
                onSubmit={(data) => console.log(data)}
            />
        </CardContent>
    )
}

export default PasswordsPage