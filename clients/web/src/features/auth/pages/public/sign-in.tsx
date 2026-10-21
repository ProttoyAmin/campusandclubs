import React from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import SignInForm from "../../components/forms/sign-in";
import { useAuth } from "../../hooks/session.hook";
import type { SignInSchemaType } from "validation/auth";

const SignIn: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (data: SignInSchemaType) => {
    login.mutate(data, {
      onSuccess: () => {
        navigate(paths.public.home, {
          replace: true,
        });
      },
    });
  };

  return (
    <>
      <SignInForm
        onSubmit={handleSignIn}
        pending={login.isPending}
        serverErrors={login.error?.response.data}
      />
    </>
  );
};

export default SignIn;
