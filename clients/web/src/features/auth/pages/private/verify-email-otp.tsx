import { useState } from 'react';
import OTPVerifyForm from '../../components/forms/otp-verify-form';
import { useAccount } from '@/features/user/hooks/user.hooks';
import { paths } from '@/settings/routes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'design/components/ui/toast';
import { useLocation } from 'react-router-dom';
import type { CodeSendResponse } from '../../api/auth.client';
import { CodeCountdown } from '@/shared/components/code-countdown';

const VerifyEmailOTP = () => {
    const [expired, setExpired] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [otp, setotp] = useState("");
    const location = useLocation()
    const { verifyAccountEmail, resendVerification } = useAccount();
    const navigate = useNavigate();
    const state: CodeSendResponse = location.state

    const handleVerify = (key: string) => {
        verifyAccountEmail.mutate(key, {
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
        resendVerification.mutate(undefined, {
            onSuccess: () => {
                toast.add({
                    title: "Verification email re-sent",
                    description: "Please check your email",
                    timeout: 3000,
                    type: "success",
                });
            },
            onError: (error) => {
                toast.add({
                    title: "Failed to resend verification email",
                    description:
                        error.response.data.errors?.[0]?.message ||
                        "Please try again later",
                    timeout: 3000,
                    type: "error",
                });
            },
        });
    };
    return (
        <div className='flex items-center justify-center p-4 flex-col gap-2.5'>
            <OTPVerifyForm
                otp={otp}
                onChange={setotp}
                onSubmit={() => handleVerify(otp)}
                onResend={handleResend}
                pending={verifyAccountEmail.isPending}
                invalid={verifyAccountEmail.isError}
            />
            <CodeCountdown expiresAt={state.expiresAt} onExpire={() => setExpired(true)} className={`${!state.expiresAt ? "text-red-700" : ""}`} />
        </div>
    )
}

export default VerifyEmailOTP;