import { useOutletContext } from "react-router-dom";
import type { ClubDetail, Club } from "@campus/api";
import type { AppError } from "@/settings/app/error";

type ClubOutletContext = {
  club: ClubDetail | undefined;
  clubError: AppError<unknown>;
};

type ClubsOutletContext = {
  clubs: Club[] | undefined;
};

export function useClubOutlet() {
  return useOutletContext<ClubOutletContext>();
}

export function useClubsOutlet() {
  return useOutletContext<ClubsOutletContext>();
}
