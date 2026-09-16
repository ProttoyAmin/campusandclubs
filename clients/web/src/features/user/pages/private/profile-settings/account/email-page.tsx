import { CardHeader, CardContent } from "design/components/ui/card";
import { useAccount, useEmails } from "@/features/user/hooks/user.hooks";
import { Button } from "design/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Input } from "design/components/ui/input";
import { toast } from "design/components/ui/toast";
import { useState } from "react";
import { Spinner } from "design/components/ui/spinner";
import { Badge } from "design/components/ui/badge";
import NavigateButtons from "@/shared/components/navigate-buttons";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import OTPVerifyForm from "@/features/auth/components/forms/otp-verify-form";

const EmailPage = () => {
    const { data: emails } = useEmails();
    const {
        addEmail,
        changePrimaryEmail,
        deleteEmail,
        resendVerification,
        verifyAccountEmail,
    } = useAccount();
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState<string>("");
    const [key, setKey] = useState<string>("");
    const [open, setOpen] = useState(false);
    const pageHeader = usePageHeader();

    React.useEffect(() => {
        const id = pageHeader.push(
            <>
                <div className="flex items-center gap-4">
                    <NavigateButtons hideForward />
                    <h1 className="text-lg font-semibold">Emails</h1>
                </div>
            </>,
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);

    const handleAddEmail = async (email: string) => {
        addEmail.mutate(email, {
            onSuccess: () => {
                setStep("code");
            },
            onError: (error) => {
                toast.add({
                    title: "Failed to add email",
                    description:
                        error.response.data.errors?.[0]?.message ||
                        "Please try again later",
                    timeout: 3000,
                    type: "error",
                });
            },
        });
    };

    const handleMakePrimary = (email: string) => {
        changePrimaryEmail.mutate(email, {
            onSuccess: () => {
                toast.add({
                    title: "Changed to primary",
                    timeout: 3000,
                    type: "success",
                });
            },
            onError: (error) => {
                toast.add({
                    title: "Failed to change email",
                    description:
                        error.response.data.errors?.[0]?.message ||
                        "Please try again later",
                    timeout: 3000,
                    type: "error",
                });
            },
        });
    };

    const handleDelete = (email: string) => {
        deleteEmail.mutate(email, {
            onSuccess: () => {
                toast.add({
                    title: "Removed",
                    timeout: 3000,
                    type: "success",
                });
            },
            onError: (error) => {
                toast.add({
                    title: "Failed to delete email",
                    description:
                        error.response.data.errors?.[0]?.message ||
                        "Please try again later",
                    timeout: 3000,
                    type: "error",
                });
            },
        });
    };

    const handleVerify = (key: string) => {
        verifyAccountEmail.mutate(key, {
            onSuccess: () => {
                setOpen(false);
                setStep("email");
                setKey("");
                toast.add({
                    title: "Verified",
                    timeout: 3000,
                    type: "success",
                });
            },
            onError: (error) => {
                console.log(error.response.data);
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
                setStep("code");
                toast.add({
                    title: "Resent",
                    timeout: 3000,
                    type: "success",
                });
            },
            onError: (error) => {
                toast.add({
                    title: "Failed to resend email",
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
        <>
            <div className="w-full flex flex-col gap-4">
                <CardHeader>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold">Emails</h2>
                        <p className="text-muted-foreground text-sm">
                            Add, remove or change the primary email address associated with
                            your account. Any changes must be verified.
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {emails?.map((email) => {
                        return (
                            <div key={email.id} className="border p-2 rounded-md">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-muted-foreground">{email.email}</h1>
                                    <Badge
                                        variant={email.verified ? "default" : "secondary"}
                                        className={`w-fit ${email.verified
                                            ? "bg-blue-900 text-white"
                                            : "bg-orange-900"
                                            }`}
                                    >
                                        {email.verified ? "Verified" : "Unverified"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    {!email.primary && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={email.primary}
                                            onClick={() => handleMakePrimary(email.email)}
                                        >
                                            Make Primary
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => handleDelete(email.email)}
                                        disabled={email.primary}
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                    <ResponsiveDialog
                        open={open}
                        onOpenChange={(value) => {
                            setOpen(value);

                            if (!value) {
                                setStep("email");
                                setEmail("");
                                setKey("");
                            }
                        }}
                        trigger={
                            <Button variant="glass" size="lg" className="rounded-full">
                                <Plus />
                                Add Email
                            </Button>
                        }
                        title={step === "email" ? "Add Email" : "Verify Email"}
                    >
                        {step === "email" ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddEmail(email);
                                }}
                                className="flex flex-col gap-3"
                            >
                                <Input
                                    type="email"
                                    value={email}
                                    required
                                    placeholder="Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full rounded-full"
                                    disabled={addEmail.isPending}
                                >
                                    {addEmail.isPending ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner />
                                            <span>Sending verification code...</span>
                                        </div>
                                    ) : (
                                        "Done"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <OTPVerifyForm
                                otp={key}
                                onChange={setKey}
                                onSubmit={() => handleVerify(key)}
                                onResend={() => handleResend()}
                                pending={verifyAccountEmail.isPending}
                                invalid={verifyAccountEmail.isError}
                            />
                        )}
                    </ResponsiveDialog>
                </CardContent>
            </div>
        </>
    );
};

export default EmailPage;
