import { useOutletContext } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import type { Club } from "@campus/api";
import type { AppError } from "@/settings/app/error";
import type { ClubDetailExtended, ClubRolesResponse, Role } from "../http/club.http";

type ClubOutletContext = {
  club: ClubDetailExtended | undefined;
  clubError: AppError<unknown>;
};

type ClubsOutletContext = {
  clubs: Club[] | undefined;
};

type ClubRolesOutletContext = {
  club: ClubDetailExtended | undefined;
  roles: ClubRolesResponse | undefined;
};

export type RolePermissionsPayload = {
  permissions: number[];
};

type RoleLayoutOutletContext = {
  club: ClubDetailExtended | undefined;
  role: Role | undefined;
  editedRole: Role | null;
  setEditedRole: Dispatch<SetStateAction<Role | null>>;
  editPermissions: RolePermissionsPayload;
  setPermissions: Dispatch<SetStateAction<RolePermissionsPayload>>;
  isDirty: boolean;
  isLoading: boolean;
}

export function useClubOutlet() {
  return useOutletContext<ClubOutletContext>();
}

export function useClubsOutlet() {
  return useOutletContext<ClubsOutletContext>();
}

export function useClubRolesOutlet() {
  return useOutletContext<ClubRolesOutletContext>();
}

export function useRoleLayoutOutlet() {
  return useOutletContext<RoleLayoutOutletContext>()
}
