import { useOutletContext } from "react-router-dom";
import type { Club } from "@campus/api";
import type { AppError } from "@/settings/app/error";
import type { ClubDetailExtended } from "../http/club.http";

type ClubOutletContext = {
  club: ClubDetailExtended | undefined;
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
