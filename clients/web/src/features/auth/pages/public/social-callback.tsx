import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "design/components/ui/spinner";
import { Button } from "design/components/ui/button";
import { paths } from "@/settings/routes";
import { queryClient } from "@/config/query-client";
import { authKeys } from "../../hooks/session.hook";
import { authentication } from "../../services/authentication";

const SocialAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      let message = "An error occurred during social login. Please try again.";
      if (error === "email_taken") {
        message =
          "An account already exists with this email address. Please sign in with your password first.";
      } else if (error === "access_denied" || error === "cancelled") {
        message = "Social login was cancelled.";
      } else if (error === "signup_closed") {
        message = "Sign up is currently closed.";
      }
      setErrorMessage(message);
      return;
    }

    const processLogin = async () => {
      try {
        const session = await authentication.check_session();
        if (session) {
          await queryClient.invalidateQueries({ queryKey: authKeys.session });
          navigate(paths.public.home, { replace: true });
        } else {
          setErrorMessage(
            "Failed to verify login session. Please try logging in again.",
          );
        }
      } catch (err) {
        console.error("Error processing social callback:", err);
        setErrorMessage(
          "An unexpected error occurred while verifying your session.",
        );
      }
    };

    processLogin();
  }, [location.search, navigate]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="text-red-500 font-medium">{errorMessage}</div>
        <Button
          variant="glass"
          className="rounded-full"
          onClick={() => navigate(paths.public.auth.signIn, { replace: true })}
        >
          Return to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <Spinner className="size-6" />
      <p className="text-sm text-muted-foreground">Completing sign in...</p>
    </div>
  );
};

export default SocialAuthCallback;