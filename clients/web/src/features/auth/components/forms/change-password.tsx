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

type ChangePasswordProps = {
    onSubmit: (data: ChangePasswordSchemaType) => void;
    pending: boolean;
    serverErrors?: AllauthError | null;
}

const ChangePassword = (props: ChangePasswordProps) => {
    const form = useForm<ChangePasswordSchemaType>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            old_password: "",
            new_password1: "",
            new_password2: "",
        },
    });
    return (
        <form onSubmit={form.handleSubmit(props.onSubmit)}>
            <FieldGroup>
                <Controller
                    name="old_password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Input
                                {...field}
                                type="password"
                                id="change-password-form-old_password"
                                aria-invalid={fieldState.invalid}
                                placeholder="Old password"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            {props.serverErrors && (
                                <FieldError
                                    errors={[
                                        ...(props.serverErrors.errors || [])
                                            .filter((item) => item.param === "old_password")
                                            .map((item) => new Error(item.message || "")),
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="new_password1"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Input
                                {...field}
                                type="password"
                                id="change-password-form-new_password1"
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
                                            .filter((item) => item.param === "new_password1")
                                            .map((item) => new Error(item.message || "")),
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="new_password2"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Input
                                {...field}
                                type="password"
                                id="change-password-form-new_password2"
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
                                            .filter((item) => item.param === "new_password2")
                                            .map((item) => new Error(item.message || "")),
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />
                <Button type="submit" disabled={props.pending} variant="glass" className={'rounded-full'}>
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