import React from 'react'
import OTPVerifyForm from '../../components/forms/otp-verify-form'
import { useLocation, useNavigate } from 'react-router-dom';
import { CodeCountdown } from '@/shared/components/code-countdown';
import type { ResetPasswordRequestResponse } from '../../api/auth.client';
import { useAuth } from '../../hooks';
import { paths } from '@/settings/routes';
import { toast } from 'design/components/ui/toast';

const VerifyPasswordResetOTP = () => {
    const [otp, setotp] = React.useState("");
    const [expired, setExpired] = React.useState(false);
    const { resetPasswordVerify } = useAuth()
    const navigate = useNavigate()
    const location = useLocation();
    const state: ResetPasswordRequestResponse = location.state;

    const handleVerify = (code: string) => {
        console.log(code);
        resetPasswordVerify.mutate({ code }, {
            onSuccess: () => {
                navigate(paths.public.home);
            },
            onError: (error) => {
                toast.add({
                    title: "Failed to verify email",
                    description:
                        error.response.data.errors?.[0]?.message ||
                        "Please try again later",
                    timeout: 3000,
                    type: "error",
                });
            },
        });
    };

    const handleResend = () => {
        console.log("");
    };
    return (
        <div className='flex items-center justify-center p-4 flex-col gap-2.5'>
            <OTPVerifyForm
                otp={otp}
                onChange={setotp}
                onSubmit={() => handleVerify(otp)}
                onResend={handleResend}
                pending={resetPasswordVerify.isPending}
                invalid={resetPasswordVerify.isError}
                isExpired={Boolean(state.data?.expiresAt)}
            />
            <CodeCountdown expiresAt={state.data?.expiresAt} onExpire={() => setExpired(true)} className={`${!state.data?.expiresAt ? "text-red-700" : ""}`} />
        </div>
    )
}

export default VerifyPasswordResetOTP