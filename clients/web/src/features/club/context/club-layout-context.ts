import { useOutletContext } from "react-router-dom";
import type { ClubDetail } from "@campus/api";
import type { AppError } from "@/settings/app/error";

type ClubOutletContext = {
  club: ClubDetail | undefined;
  clubError: AppError<unknown>;
};

export function useClubOutlet() {
  return useOutletContext<ClubOutletContext>();
}