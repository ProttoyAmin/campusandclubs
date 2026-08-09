import { useOutletContext } from "react-router-dom";
import type { UserProfileLayoutProps } from "@/layouts/user";

export function useUserOutlet() {
  return useOutletContext<UserProfileLayoutProps>();
}