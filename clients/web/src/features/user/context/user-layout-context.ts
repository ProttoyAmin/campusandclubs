import { useOutletContext } from "react-router-dom";
import type { UserProfileLayoutProps } from "@/layouts/user";
import type { UserSettingsLayoutProps } from "@/layouts/settings-layout/settings-layout";

export function useUserOutlet() {
  return useOutletContext<UserProfileLayoutProps>();
}

export function useSettingsOutlet() {
  return useOutletContext<UserSettingsLayoutProps>();
}
