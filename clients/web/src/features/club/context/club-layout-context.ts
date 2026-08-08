import { useOutletContext } from "react-router-dom";
import type { ClubDetail } from "@campus/api";

type ClubOutletContext = {
  club: ClubDetail | undefined;
};

export function useClubOutlet() {
  return useOutletContext<ClubOutletContext>();
}