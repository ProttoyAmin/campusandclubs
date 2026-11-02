import React from 'react';
import {
    Tabs,
    TabsContent,
    TabsTrigger,
    TabsList
} from "design/components/ui/tabs";
import { useComponentId } from '@/shared/hooks/id';
import { Input } from 'design/components/ui/input';
import { Switch } from 'design/components/ui/switch';
import { createRoleSchema, type ClubRoleCreateSchemaType } from 'validation/club';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "design/components/ui/field";
import { useClubPermissions } from '../../hooks/club.hooks';
import { Button } from 'design/components/ui/button';

const CreateRoleForm = ({ onSubmit, isCreating }: { onSubmit: (data: ClubRoleCreateSchemaType) => void, isCreating: boolean }) => {
    const { data } = useClubPermissions()
    const formId = useComponentId('club-role-', 'create-form')
    const form = useForm<ClubRoleCreateSchemaType>({
        resolver: zodResolver(createRoleSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            color: "",
            permissions: []
        }
    })

    const handleSubmit = (data: ClubRoleCreateSchemaType) => {
        console.log(data)
        onSubmit(data)
    }

    return (
        <form id={formId} onSubmit={form.handleSubmit((data) => handleSubmit(data))}>
            <Tabs defaultValue="display" className={'gap-5 max-h-svh'}>
                <TabsList variant="line">
                    <TabsTrigger value="display">Display</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                <TabsContent value="display" className={'flex flex-col gap-2.5'}>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <>
                                <FieldLabel>Role name</FieldLabel>
                                <Input type="text" placeholder="New role..." value={field.value} onChange={field.onChange} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </>
                        )}
                    />
                    <Controller
                        name="color"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <>
                                <FieldLabel>Color</FieldLabel>
                                <Input type="text" placeholder="#4455kk" value={field.value} onChange={field.onChange} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </>
                        )}
                    />
                </TabsContent>
                <TabsContent value="permissions" className={''}>
                    <Controller
                        name="permissions"
                        control={form.control}
                        render={({ field }) => (
                            <FieldGroup className='max-h-50 overflow-y-auto'>
                                {data?.map((option) => {
                                    const isChecked = field.value.includes(option.id)

                                    const handleToggle = (checked: boolean) => {
                                        if (checked) {
                                            field.onChange([...field.value, option.id])
                                        } else {
                                            field.onChange(field.value.filter((id) => id !== option.id))
                                        }
                                    }

                                    return (
                                        <FieldLabel key={option.id} htmlFor={`switch-${option.id}`}>
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>{option.name}</FieldTitle>
                                                </FieldContent>
                                                <Switch
                                                    id={`switch-${option.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={handleToggle}
                                                />
                                            </Field>
                                        </FieldLabel>
                                    )
                                })}
                            </FieldGroup >
                        )}
                    />
                </TabsContent>
            </Tabs>
            <Button type='submit' disabled={isCreating}>Submit</Button>
        </form>
    )
}

export default CreateRoleForm
