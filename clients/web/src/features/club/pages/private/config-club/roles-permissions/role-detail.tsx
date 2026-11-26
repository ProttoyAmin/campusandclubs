import { ClubRoleMenu } from "@/config/menu/club/role-menu";
import { useRoleLayoutOutlet } from "@/features/club/context/club-layout-context";
import Permissions from "@/features/club/pages/private/config-club/roles-permissions/permissions";
import RoleMembers from "@/features/club/pages/private/config-club/roles-permissions/role-members";
import { Field, FieldLabel } from "design/components/ui/field";
import { Input } from "design/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "design/components/ui/tabs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const RoleDetail = () => {
  const { club, editedRole, setEditedRole, isLoading } = useRoleLayoutOutlet();
  const { roleId: routeRoleId } = useParams();
  const roleId = routeRoleId ?? "";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const menu = ClubRoleMenu(club.slug, roleId);
  const activeTab = menu.find((item) => item.isActive(pathname)) ?? menu[0];

  const handleTabChange = (tabId: string) => {
    const item = menu.find((entry) => String(entry.id) === tabId);
    if (!item) return;

    navigate(typeof item.link === "function" ? item.link(roleId) : item.link);
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={String(activeTab.id)}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList variant="line" className="w-full justify-start">
          {menu.map((item) => (
            <TabsTrigger key={item.id} value={String(item.id)}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="1" className="pt-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading role…</p>
          ) : (
            <div className="max-w-xl space-y-6">
              <Field>
                <FieldLabel htmlFor="role-name">Role name</FieldLabel>
                <Input
                  id="role-name"
                  value={editedRole?.name ?? ""}
                  onChange={(event) =>
                    setEditedRole((role) =>
                      role ? { ...role, name: event.target.value } : role,
                    )
                  }
                  placeholder="Role name"
                  minLength={2}
                  maxLength={50}
                  required
                  disabled={!editedRole}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="role-color">Role color</FieldLabel>
                <div className="flex items-center gap-3">
                  <Input
                    id="role-color"
                    value={editedRole?.color ?? ""}
                    onChange={(event) =>
                      setEditedRole((role) =>
                        role ? { ...role, color: event.target.value } : role,
                      )
                    }
                    placeholder="#4455AA"
                    maxLength={9}
                    disabled={!editedRole}
                  />
                  <span
                    aria-label="Role color preview"
                    className="size-8 shrink-0 rounded-full border"
                    style={{ backgroundColor: editedRole?.color ?? "transparent" }}
                  />
                </div>
              </Field>
            </div>
          )}
        </TabsContent>

        <TabsContent value="2" className="pt-4">
          <Permissions />
        </TabsContent>

        <TabsContent value="3" className="pt-4">
          <RoleMembers />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleDetail;
