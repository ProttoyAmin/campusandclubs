import React from "react";
import type { RegisterRequestWritable } from "@campus/api";
import SignUpForm from "@/features/auth/components/forms/sign-up-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/session.hook";
import { paths } from "@/settings/routes";

const SignUp: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData: RegisterRequestWritable) => {
    signUp.mutate(formData, {
      onSuccess: () => {
        navigate(paths.public.auth.signIn);
      },
    });
  };

  return (
    <>
      <SignUpForm
        onSubmit={handleSubmit}
        pending={signUp.isPending}
        serverErrors={signUp.error?.response.data ?? undefined}
      />
    </>
  );
};

export default SignUp;
