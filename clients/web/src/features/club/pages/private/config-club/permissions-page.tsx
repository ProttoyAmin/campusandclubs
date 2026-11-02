import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "design/components/ui/table";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useClubInfo } from "@/features/club/hooks/club.hooks";
import { Button } from "design/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Edit04Icon,
  ShieldUserIcon,
  UserRoundIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "design/components/ui/tooltip";
import { Spinner } from "design/components/ui/spinner";
import { Badge } from "design/components/ui/badge";
import { useIsMobile } from "design/hooks/use-mobile";
import EmptyState from "@/shared/components/empty-state";
import { Input } from "design/components/ui/input";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from "design/components/ui/tabs";
import { Switch } from "design/components/ui/switch";
import CreateRoleForm from "@/features/club/components/forms/create-role-form";
import type { ClubRoleCreateSchemaType } from "validation/club";
import { toast } from "design/components/ui/toast";

const ClubPermissionsPage = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile();
  const { club } = useClubOutlet();
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const canAccess =
    club?.me_permissions?.includes("manage_roles") || club?.is_owner;
  const { getRoles, createRole } = useClubInfo(club.slug);
  const roleData = getRoles(club.id, canAccess);
  const createRoleMutation = createRole(club.id)

  if (!canAccess) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <EmptyState
          title="Restricted Access"
          description="You don't have permission to view roles. GET LOST"
          icon={<HugeiconsIcon icon={ViewOffSlashIcon} />}
        />
      </div>
    );
  }

  if (roleData.isLoading || roleData.isPending) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (roleData?.data?.roles?.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <EmptyState
          title="No Roles"
          description="No roles created yet"
          icon={<HugeiconsIcon icon={ShieldUserIcon} />}
        />
      </div>
    );
  }

  const renderCreateRoleDialog = () => {
    const onSubmit = (data: ClubRoleCreateSchemaType) => {
      console.log('data from dialog');
      createRoleMutation.mutateAsync(data, {
        onSuccess: () => {
          toast.add({
            title: "Created role"
          })
        }
      })
      setIsCreating(false)
    }
    return (
      <ResponsiveDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        trigger={
          <Button variant="outline" className={"rounded-md"}>
            Create Role
          </Button>
        }
      >
        <CreateRoleForm onSubmit={onSubmit} isCreating={createRoleMutation.isPending} />
      </ResponsiveDialog>
    );
  };

  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold mb-6">
            Roles - {roleData.data.total_roles}
          </h1>
          {/* <pre>{JSON.stringify(roleData.data, null, 3)}</pre> */}
          {renderCreateRoleDialog()}
        </div>
        <div className="rounded-md border divide-y divide-border">
          {roleData.data.roles?.map((role, index) => (
            <React.Suspense
              fallback={
                <div className="size-8 rounded-full bg-muted animate-pulse"></div>
              }
            >
              <div
                key={role.id}
                className={`w-full flex justify-between items-center p-4 ${index !== roleData.data.roles.length - 1 ? "border-border/50 border-b" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="size-3.5 rounded-full"
                    style={{ backgroundColor: role.color }}
                  ></div>
                  <div className="">
                    <p className="font-semibold text-sm">{role.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {role.user_count} members
                    </p>
                  </div>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
              </div>
            </React.Suspense>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-2 flex gap-2">
        <Input type="text" placeholder="Search roles..." />
        {renderCreateRoleDialog()}
      </div>
      <Table>
        <TableHeader>
          <TableHead>Roles</TableHead>
          <TableHead colSpan={2}>Members</TableHead>
        </TableHeader>
        <TableBody>
          {roleData.data?.roles?.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <div
                      className="size-2 rounded-full"
                      style={{ backgroundColor: role.color }}
                    ></div>
                    {role.name}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={UserRoundIcon} className="size-5" />
                      {role.user_count}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View members</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              {club.is_owner && (
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon-lg"
                        className={"p-0 m-0"}
                        variant="ghost"
                        onClick={() => {
                          navigate(paths.private.club.roleDetails(club.slug))
                        }}
                      >
                        <HugeiconsIcon icon={Edit04Icon} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage Role</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClubPermissionsPage;
