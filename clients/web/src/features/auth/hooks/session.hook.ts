import { useMutation, useQuery } from "@tanstack/react-query";
import { authentication } from "../services/authentication";
import { queryClient } from "@/config/query-client";
import type {
  ApiAccountsAuthJwtRefreshCreateResponse,
  RegisterRequestWritable,
} from "@campus/api";
import type { AxiosResponse } from "axios";
import type { AllauthError, SignUpError } from "../api/auth.client";
import type { AppError } from "@/settings/app/error";
import type { SignInSchemaType } from "validation/auth";

export type ResetPasswordErrors = {

}

export const authKeys = {
  session: ["auth", "session"] as const,
};

export const useSession = () => {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => authentication.check_session(),
    staleTime: 1000 * 60 * 5, // 5 min, tune access token lifetime
    retry: false,
  });
};

/**
 * Exposes auth helpers for components.
 *
 * The API client interceptors (token getter + 401 refresh handler)
 * are wired up in the Authentication constructor at module load time,
 * so they work regardless of whether this hook is called.
 */
export const useAuth = () => {
  const logout = useMutation({
    mutationFn: () => authentication.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, false);
      queryClient.clear(); // wipe any user-scoped cached data on logout
    },
  });

  const signUp = useMutation<
    AxiosResponse<RegisterRequestWritable>,
    AppError<SignUpError>,
    RegisterRequestWritable
  >({
    mutationFn: (data) => authentication.sign_up(data),
    onSuccess: (data) => {
      console.log("Registration successful:", data);
    },
  });

  const login = useMutation<
    AxiosResponse<ApiAccountsAuthJwtRefreshCreateResponse>,
    AppError<AllauthError>,
    SignInSchemaType
  >({
    mutationFn: (data) =>
      authentication.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      queryClient.clear()
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
    { key: string, new_password: string }
  >({
    mutationFn: ({ key, new_password }) => {
      return authentication.reset_password(key, new_password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });


  return { logout, login, signUp, forgotPassword, resetPassword };
};
