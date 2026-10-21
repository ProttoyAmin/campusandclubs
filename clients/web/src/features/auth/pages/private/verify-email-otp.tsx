import { useState } from 'react';
import OTPVerifyForm from '../../components/forms/otp-verify-form';
import { useAccount } from '@/features/user/hooks/user.hooks';
import { paths } from '@/settings/routes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'design/components/ui/toast';

const VerifyEmailOTP = () => {
    const [otp, setotp] = useState("");
    const { verifyAccountEmail, resendVerification } = useAccount();

    const navigate = useNavigate();

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
                    title: "Verification email sent",
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
        <div className='flex items-center justify-center p-4'>
            <OTPVerifyForm
                otp={otp}
                onChange={setotp}
                onSubmit={() => handleVerify(otp)}
                onResend={handleResend}
                pending={verifyAccountEmail.isPending}
                invalid={verifyAccountEmail.isError}
            />
        </div>
    )
}

export default VerifyEmailOTP;