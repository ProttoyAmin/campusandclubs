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
      onSuccess: (data) => {
        const response = data.data.data
        navigate(paths.private.auth.verify_email_otp, {
          state: {
            email: response.email,
            verification_required: response.verification_required,
            code_expires_in: response.code_expires_in,
            max_attempts: response.max_attempts,
            expiresAt: Date.now() + response.code_expires_in * 1000
          }
        });
      },
      onError: (error) => {
        console.log(error.response.data);
      }
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
