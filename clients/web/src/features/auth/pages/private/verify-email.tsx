import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks";
import { Spinner } from "design/components/ui/spinner";
import { routes } from "@/settings/routes";

const VerifyEmail = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(3);

  const query = new URLSearchParams(location.search);
  const next = query.get("next") || routes.auth.public.sign_in;

  const { verifyEmail } = useAuth();

  const handle_verify = () => {
    verifyEmail.mutate(key, {
      onSuccess: () => {
        navigate(next);
      },
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log("Verification complete after 3 seconds");
          handle_verify();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [key]);

  if (verifyEmail.isPending) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (verifyEmail.isSuccess) {
    navigate(next);
    return null;
  }

  if (verifyEmail.isError) {
    return (
      <div className="flex items-center justify-center">
        <div>Something went wrong</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-10">
        <Spinner />
        <div className="text-sm text-muted-foreground">
          Verifying email in {countdown}...
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
