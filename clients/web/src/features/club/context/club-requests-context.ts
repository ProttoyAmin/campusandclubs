import { useOutletContext } from "react-router-dom";
import type { ApiClubsApplicationsList2Response } from "@campus/api";

type ClubRequestsOutletContext = {
    applications: ApiClubsApplicationsList2Response
};

export function useClubRequestsOutlet() {
    return useOutletContext<ClubRequestsOutletContext>();
}