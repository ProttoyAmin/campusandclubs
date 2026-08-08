import { useOutletContext } from "react-router-dom";
import type { UserProfile } from "@campus/api";

type UserOutletContext = {
  user: UserProfile | undefined;
};

export function useUserOutlet() {
  return useOutletContext<UserOutletContext>();
}