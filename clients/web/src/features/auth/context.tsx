import { useOutletContext } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import type { AppSession } from "./services/authentication";

export type AuthContextType = {
  authState: AppSession;
  isLoading: boolean;
  setAuthState: Dispatch<SetStateAction<AppSession>>;
};


export function useAuthOutletContext() {
  return useOutletContext<AuthContextType>();
}
