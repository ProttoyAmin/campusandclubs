import { useMutation } from "@tanstack/react-query";
import { authentication } from "../services/authentication";
import type { RegisterRequestWritable } from "@campus/api";
import axios, { AxiosError } from "axios";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequestWritable) => authentication.register(data),
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