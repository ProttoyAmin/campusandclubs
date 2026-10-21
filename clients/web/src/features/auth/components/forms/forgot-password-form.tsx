import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "design/components/ui/card";
import { Field } from "design/components/ui/field";
import { Input } from "design/components/ui/input";
import React from "react";
import type { AllauthError } from "../../api/auth.client";
import { Button } from "design/components/ui/button";

type Props = {
    onSubmit: (email: string) => void;
    pending: boolean;
    serverErrors?: AllauthError | null;
    defaultEmail?: string;
}

const ForgotPasswordForm = ({ onSubmit, pending, serverErrors, defaultEmail }: Props) => {
    const [email, setEmail] = React.useState(defaultEmail || "");

    return (
        <>
            <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email address and we'll send you a link to reset your
                    password.
                </CardDescription>
            </CardHeader>
            <CardContent className="">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(email)
                }}>
                    <Field>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Field>
                </form>
            </CardContent>
            <CardFooter>
                <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full"
                    variant="glass"
                >
                    Reset password
                </Button>
            </CardFooter>
        </>
    );
};

export default ForgotPasswordForm