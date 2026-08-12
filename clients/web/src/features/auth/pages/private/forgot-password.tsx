import { Button } from "design/components/ui/button";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "design/components/ui/card";
import { Field } from "design/components/ui/field";
import { Input } from "design/components/ui/input";
import { useState } from "react";
import { useAuth } from "../../hooks";
import { toast } from "design/components/ui/toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword } = useAuth();
  const onSubmit = () => {
    forgotPassword.mutate(email, {
      onSuccess: () => {
        toast.add({
          title: "Password reset email sent successfully",
          type: "success",
          timeout: 5000,
        });
      },
      onError: (error) => {
        toast.add({
          title: error.message,
          type: "error",
          timeout: 5000,
        });
      },
    });
  };

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
        <form>
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
          className="w-full"
          variant="secondary"
          onClick={onSubmit}
        >
          Reset password
        </Button>
      </CardFooter>
    </>
  );
};

export default ForgotPasswordPage;
