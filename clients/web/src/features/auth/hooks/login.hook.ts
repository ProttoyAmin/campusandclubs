import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { authentication } from "../services/authentication";
import type { RegisterWritable, CustomTokenObtainPairWritable } from "@campus/api";
import { queryClient } from "@/config/query-client";
import { authKeys } from "./session.hook";


export const useLogin = () => {
  return useMutation({
    mutationFn: (data: CustomTokenObtainPairWritable) => authentication.login(data),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, true);
    },
    
    onError: (error: AxiosError) => {
      if (axios.isAxiosError(error)) {
        console.log("Login failed:", error.response?.data);
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterWritable) => authentication.register(data),
    onSuccess: (data) => {
      console.log("Registration successful:", data);
    },
    onError: (error: AxiosError) => {
      if (axios.isAxiosError(error)) {
        console.log("Registration failed:", error);
        console.log("Registration failed:", error.response?.data);
      }
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => authentication.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, false);
      queryClient.clear(); // wipe any user-scoped cached data on logout
    },
  });
};