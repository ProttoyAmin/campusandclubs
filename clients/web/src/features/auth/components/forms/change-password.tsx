import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from 'design/components/ui/input';
import { Button } from 'design/components/ui/button';
import { Spinner } from 'design/components/ui/spinner';
import {
    Field,
    FieldError,
    FieldGroup,
} from 'design/components/ui/field';
import type { ChangePasswordSchemaType } from 'validation/auth';
import { changePasswordSchema } from 'validation/auth';
import type { AllauthError } from '../../api/auth.client';
import { useSession } from '../../hooks';

type ChangePasswordProps = {
    onSubmit: (data: ChangePasswordSchemaType) => void;
    pending: boolean;
    serverErrors?: AllauthError | null;
}

const ChangePassword = (props: ChangePasswordProps) => {
    const { data: session } = useSession()
    const form = useForm<ChangePasswordSchemaType>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: {
            current_password: "",
            new_password: "",
            repeat_password: "",
        },
    });

    const handleOnSubmit = React.useCallback((data: ChangePasswordSchemaType) => {
        props.onSubmit(data);
        form.reset();
    }, [props.onSubmit])

    return (
        <form onSubmit={form.handleSubmit(handleOnSubmit)}>
            <FieldGroup>
                <Controller
                    name="current_password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Input
                                {...field}
                                type="text"
                                id="change-password-form-current_password"
                                aria-invalid={fieldState.invalid}
                                placeholder="Current password"
                                autoComplete="off"
                                disabled={!session.data?.user.has_usable_password}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            {props.serverErrors?.errors && (
                                <FieldError
                                    errors={[
                                        ...(props.serverErrors.errors || [])
                                            .filter((item) => item.param === "current_password")
                                            .map((item) => new Error(item.message || "")),
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="new_password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Input
                                {...field}
                                type="text"
                                id="change-password-form-new_password"
                                aria-invalid={fieldState.invalid}
                                placeholder="New password"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            {props.serverErrors && (
                                <FieldError
                                    errors={[
                                        ...(props.serverErrors.errors || [])
                                            .filter((item) => item.param === "new_password")
                                            .map((item) => new Error(item.message || "")),
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="repeat_password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Input
                                {...field}
                                type="text"
                                id="change-password-form-repeat_password"
                                aria-invalid={fieldState.invalid}
                                placeholder="Confirm new password"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            {props.serverErrors && (
                                <FieldError
                                    errors={[
                                        ...(props.serverErrors.errors || [])
                                            .filter((item) => item.param === "repeat_password")
                                            .map((item) => new Error(item.message || "")),
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />
                <Button type="submit" disabled={props.pending || !form.formState.isValid} variant="glass" className={'rounded-full'} size='lg'>
                    {props.pending && (
                        <Spinner className="size-4" data-icon="inline-start" />
                    )}
                    {props.pending ? "Changing password..." : "Change password"}
                </Button>
            </FieldGroup>
        </form>
    )
}

export default ChangePassword