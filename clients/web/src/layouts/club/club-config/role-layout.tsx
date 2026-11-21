import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useRole, useUpdateRole } from "@/features/club/hooks/club.hooks";
import type { Role } from "@/features/club/http/club.http";
import { paths } from "@/settings/routes";
import AppSnackbar from "@/shared/components/app-snackbar";
import { Button } from "design/components/ui/button";
import React from "react";
import {
  Outlet,
  useBlocker,
  useBeforeUnload,
  useParams,
} from "react-router-dom";
import { useShakeDocument } from "@/shared/hooks/use-screen-shake";


const getPermissionIds = (role: Role) =>
  role.permissions.map((permission) => permission.id);

const RoleLayout = () => {
  const { club } = useClubOutlet();
  const { roleId: routeRoleId } = useParams();
  const roleId = routeRoleId ?? "";
  const { data: roleResponse, isLoading: isRoleLoading } = useRole(
    club.id,
    roleId,
  );
  const currentRole = roleResponse?.data?.data;
  const updateRole = useUpdateRole(club.id, roleId, club.slug);
  const [savedRole, setSavedRole] = React.useState<Role | null>(null);
  const [editedRole, setEditedRole] = React.useState<Role | null>(null);
  const [editPermissions, setEditPermissions] = React.useState({
    permissions: [] as number[],
  });
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const initializedRoleId = React.useRef<string | null>(null);
  
  const shake = useShakeDocument();

  
  const isDirty = Boolean(
    savedRole &&
      editedRole &&
      savedRole.id === editedRole.id &&
      (savedRole.name !== editedRole.name ||
        savedRole.color !== editedRole.color ||
        getPermissionIds(savedRole).sort((a, b) => a - b).join(",") !==
          [...editPermissions.permissions].sort((a, b) => a - b).join(",")),
  );

  const roleRoot = paths.private.club.roleDetail(roleId, club.slug);
  const isInsideRole = (pathname: string) =>
    pathname === roleRoot || pathname.startsWith(`${roleRoot}/`);
  const blocker = useBlocker(
    ({ nextLocation }) => isDirty && !isInsideRole(nextLocation.pathname),
  );
  const blockerRef = React.useRef(blocker);
  blockerRef.current = blocker;
  
  const blockedKey = blocker.state === "blocked" ? blocker.location.key : null;

  React.useEffect(() => {
    if (!currentRole || initializedRoleId.current === currentRole.id) return;

    initializedRoleId.current = currentRole.id;
    setSavedRole(currentRole);
    setEditedRole(currentRole);
    setEditPermissions({ permissions: getPermissionIds(currentRole) });
    setSaveError(null);
  }, [currentRole]);

  React.useEffect(() => {
  if (blockedKey) shake();
}, [blockedKey, shake]);

  useBeforeUnload(
    React.useCallback(
      (event: BeforeUnloadEvent) => {
        if (!isDirty) return;
        event.preventDefault();
        event.returnValue = "";
      },
      [isDirty],
    ),
  );

  const handleDiscard = () => {
    if (!savedRole) return;
    setEditedRole(savedRole);
    setEditPermissions({ permissions: getPermissionIds(savedRole) });
    setSaveError(null);

    if (blocker.state === "blocked") blocker.proceed();
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editedRole || !isDirty || updateRole.isPending) return;

    setSaveError(null);
    try {
      const updatedRole = await updateRole.mutateAsync({
        name: editedRole.name.trim(),
        color: editedRole.color,
        permissions: editPermissions.permissions,
      });
      setSavedRole(updatedRole);
      setEditedRole(updatedRole);
      setEditPermissions({ permissions: getPermissionIds(updatedRole) });

      const currentBlocker = blockerRef.current;
      if (currentBlocker.state === "blocked") currentBlocker.proceed();
    } catch (error) {
      const responseError = error as {
        response?: { data?: { detail?: string } };
      };
      setSaveError(
        responseError.response?.data?.detail ??
          "The role could not be saved. Please try again.",
      );
    }
  };

  return (
    <section className="w-full min-w-0">
      <form className="min-w-0 space-y-6 pb-24" onSubmit={handleSave}>
        <Outlet
          context={{
            club,
            role: currentRole,
            editedRole,
            setEditedRole,
            editPermissions,
            setPermissions: setEditPermissions,
            isDirty,
            isLoading: isRoleLoading,
          }}
        />

        <AppSnackbar open={isDirty}>
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {blocker.state === "blocked"
                ? "You’re leaving this role with unsaved changes."
                : "You have unsaved changes to this role."}
            </p>
            <p className="text-sm text-muted-foreground">
              {saveError ??
                "Save your changes or discard them before leaving."}
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={updateRole.isPending}
              onClick={handleDiscard}
            >
              Discard
            </Button>
            <Button type="submit" disabled={updateRole.isPending}>
              {updateRole.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </AppSnackbar>
      </form>
    </section>
  );
};

export default RoleLayout;
