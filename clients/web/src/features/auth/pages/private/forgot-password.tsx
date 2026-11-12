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
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks";
import { toast } from "design/components/ui/toast";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import NavigateButtons from "@/shared/components/navigate-buttons";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword } = useAuth();
  const pageHeader = usePageHeader()
  const navigate = useNavigate()


  useEffect(() => {
    if (forgotPassword) {
      const id = pageHeader.push(
        <NavigateButtons hideForward />
      );
      return () => pageHeader.pop(id)
    }
  }, [pageHeader.push, pageHeader.pop, forgotPassword.data, location.pathname, navigate])

  const onSubmit = () => {
    forgotPassword.mutate(email, {
      onSuccess: (data) => {
        navigate(paths.public.auth.resetPasswordOtp, {
          state: {
            success: data.success,
            message: data.message,
            code_expires_in: data.data.code_expires_in,
            max_attempts: data.data.max_attempts,
            expiresAt: Date.now() + data.data.code_expires_in * 1000
          }
        })
      },
      onError: (error) => {
        console.log(error.response.data);
        // toast.add({
        //   title: error.response.,
        //   type: "error",
        //   timeout: 5000,
        // });
      },
    });
  };

  return (
    <>
      <CardHeader>
        {/* <CardTitle>Forgot Password</CardTitle> */}
        <CardDescription>
          Enter your email address and we'll send you a code to your verified email so that you can reset your
          password.
        </CardDescription>
      </CardHeader>
      {JSON.stringify(forgotPassword.error?.response?.data)}
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
          size="lg"
          className="w-full rounded-full"
          variant="outline"
          onClick={onSubmit}
        >
          Reset password
        </Button>
      </CardFooter>
    </>
  );
};

export default ForgotPasswordPage;
