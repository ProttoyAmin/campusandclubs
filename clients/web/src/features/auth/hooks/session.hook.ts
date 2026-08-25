import { useMutation, useQuery } from "@tanstack/react-query";
import { authentication, type SocialProvider } from "../services/authentication";
import { queryClient } from "@/config/query-client";
import type {
  AccountsAuthJwtRefreshCreateResponse,
  RegisterRequestWritable,
} from "@campus/api";
import type { AxiosResponse } from "axios";
import type { AllauthError, SignUpError } from "../api/auth.client";
import type { AppError } from "@/settings/app/error";
import type { SignInSchemaType } from "validation/auth";

export const authKeys = {
  session: ["auth", "session"] as const,
};


export const useSocials = () => {
  const socialLogin = useMutation({
    mutationFn: async (provider: SocialProvider) => authentication.submitSocialLogin(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });

  return { socialLogin };
};


export const useSession = () => {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => authentication.check_session(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useAuth = () => {
  const logout = useMutation({
    mutationFn: async () => {
      await authentication.logout();
      await queryClient.cancelQueries({
        queryKey: authKeys.session,
      });

      queryClient.setQueryData(authKeys.session, false);

      await queryClient.invalidateQueries({
        queryKey: authKeys.session,
      });
    },
  });

  const verifyEmail = useMutation<
    AxiosResponse<void>,
    AppError<AllauthError>,
    string
  >({
    mutationFn: (key: string) => authentication.verify_email(key),
  });

  const signUp = useMutation<
    AxiosResponse<RegisterRequestWritable>,
    AppError<SignUpError>,
    RegisterRequestWritable
  >({
    mutationFn: (data) => authentication.sign_up(data),
  });

  const login = useMutation<
    AxiosResponse<AccountsAuthJwtRefreshCreateResponse>,
    AppError<AllauthError>,
    SignInSchemaType
  >({
    mutationFn: (data) => authentication.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      queryClient.clear();
    },
  });

  const forgotPassword = useMutation({
    mutationFn: (email: string) => {
      return authentication.request_password_reset(email);
    },
  });

  const resetPassword = useMutation<
    AxiosResponse,
    AppError<AllauthError>,
    { key: string; new_password: string }
  >({
    mutationFn: ({ key, new_password }) => {
      return authentication.reset_password(key, new_password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });

  return {
    logout,
    login,
    signUp,
    forgotPassword,
    resetPassword,
    verifyEmail,
  };
};
