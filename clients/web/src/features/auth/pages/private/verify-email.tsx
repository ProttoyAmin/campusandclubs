import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks";
import { Spinner } from "design/components/ui/spinner";
import { routes } from "@/settings/routes";

const VerifyEmail = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
    handle_verify();
  }, [key]);

  if (verifyEmail.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (verifyEmail.isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Something went wrong</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div>Email verified successfully. Redirecting to login page...</div>
      {setTimeout(() => {
        <Spinner />;
        navigate(next);
      }, 1000)}
    </div>
  );
};

export default VerifyEmail;
