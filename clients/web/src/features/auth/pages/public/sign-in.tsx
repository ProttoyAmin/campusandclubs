import React from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import SignInForm from "../../components/forms/sign-in";
import { useAuth } from "../../hooks/session.hook";
import type { SignInSchemaType } from "validation/auth";
import { useAuthOutletContext } from "../../context";
import { Skeleton } from "design/components/ui/skeleton"

export function SignInSkeletonCard() {
  return (
    <div className="w-full bg-background flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}


const SignIn: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {authState, isLoading} = useAuthOutletContext()

  const handleSignIn = async (data: SignInSchemaType) => {
    login.mutate(data, {
      onSuccess: () => {
        navigate(paths.public.home, {
          replace: true,
        });
      },
    });
  };

  if (isLoading) {
    return <SignInSkeletonCard />
  }

  return (
      <SignInForm
        onSubmit={handleSignIn}
        pending={login.isPending}
        serverErrors={login.error?.response?.data}
      />
  );
};

export default SignIn;
