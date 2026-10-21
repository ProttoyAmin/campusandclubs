import { useOutletContext } from "react-router-dom";
import type { UserProfileLayoutProps } from "@/layouts/user";
import type { UserSettingsLayoutProps } from "@/layouts/settings-layout/settings-layout";
import type { ProfileOutletContext } from "../pages/public/Profile";

export function useUserOutlet() {
  return useOutletContext<UserProfileLayoutProps>();
}

export function useProfileOutlet() {
  return useOutletContext<ProfileOutletContext>();
}

export function useSettingsOutlet() {
  return useOutletContext<UserSettingsLayoutProps>();
}
