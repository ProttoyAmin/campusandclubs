import { Button } from 'design/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from 'design/components/ui/input-otp';
import { Spinner } from 'design/components/ui/spinner';
import React from 'react';

type OTPProps = {
    otp: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: () => void;
    onResend: () => void;
    pending: boolean;
    invalid?: boolean;
}


const OTPVerifyForm = (props: OTPProps) => {
    return (
        <form className="flex flex-col gap-3 w-full" onSubmit={(e) => {
            e.preventDefault();
            props.onSubmit();
        }}>
            <div className='w-fit mx-auto'>
                <InputOTP maxLength={8} value={props.otp} onChange={(value) => props.onChange(value)}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                        <InputOTPSlot index={1} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                        <InputOTPSlot index={2} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                        <InputOTPSlot index={3} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={4} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                        <InputOTPSlot index={5} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                        <InputOTPSlot index={6} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                        <InputOTPSlot index={7} className='w-12 h-10'
                            aria-invalid={props.invalid} />
                    </InputOTPGroup>
                </InputOTP>
            </div>
            {props.invalid && (
                <p className="text-red-500 text-sm">
                    Invalid code
                </p>
            )}

            <Button
                type="submit"
                variant="outline"
                className="w-full rounded-full"
            >
                {props.pending ? (
                    <div className="flex items-center gap-2">
                        <Spinner />
                        <span>Verifying...</span>
                    </div>
                ) : (
                    "Confirm"
                )}
            </Button>

            <Button variant="default" onClick={props.onResend} className={'w-full rounded-full'}>
                {props.pending ? (
                    <div className="flex items-center gap-2">
                        <Spinner />
                        <span>Resending...</span>
                    </div>
                ) : (
                    "Resend"
                )}
            </Button>
        </form>
    )
}

export default OTPVerifyForm