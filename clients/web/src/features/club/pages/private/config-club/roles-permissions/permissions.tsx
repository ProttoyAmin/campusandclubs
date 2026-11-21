import { useRoleLayoutOutlet } from "@/features/club/context/club-layout-context";
import { useClubPermissions } from "@/features/club/hooks/club.hooks";
import {
    Field,
    FieldContent,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "design/components/ui/field";
import { Switch } from "design/components/ui/switch";

const Permissions = () => {
    const { editPermissions, setPermissions } = useRoleLayoutOutlet();
    const { data: clubPermissions } = useClubPermissions();


    const handleToggle = (permissionId: number, checked: boolean) => {

        const nextPermissionIds = checked
            ? Array.from(new Set([...editPermissions.permissions, permissionId]))
            : editPermissions.permissions.filter((id) => id !== permissionId);
        const payload = { permissions: nextPermissionIds };

        setPermissions(payload);
        console.log(JSON.stringify(payload, null, 2));
    };

    return (
        <FieldGroup className="w-full space-y-2">
            {clubPermissions?.map((permission) => {
                const inputId = `permission-${permission.id}`;

                return (
                    <FieldLabel key={permission.id} htmlFor={inputId}>
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>{permission.name}</FieldTitle>
                            </FieldContent>
                            <Switch
                                id={inputId}
                                checked={editPermissions.permissions.includes(permission.id)}
                                onCheckedChange={(checked) =>
                                    handleToggle(permission.id, checked === true)
                                }
                            />
                        </Field>
                    </FieldLabel>
                );
            })}
        </FieldGroup>
    );
};

export default Permissions;
