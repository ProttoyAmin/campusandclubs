import { Controller, useForm } from "react-hook-form";
import {
  resetPasswordSchema,
  type ResetPasswordSchemaType,
} from "validation/auth";
import { Input } from "design/components/ui/input";
import { Button } from "design/components/ui/button";
import { Spinner } from "design/components/ui/spinner";

import {
  Field,
  FieldError,
  FieldGroup,
} from "design/components/ui/field";
import type { AllauthError } from "../../api/auth.client";
import { zodResolver } from "@hookform/resolvers/zod";

type ResetPasswordFormProps = {
  onSubmit: (data: ResetPasswordSchemaType) => void;
  serverErrors?: AllauthError | null;
  pending: boolean;
};
const ResetPasswordForm = (props: ResetPasswordFormProps) => {
  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      re_password: "",
    },
  });
  return (
    <form onSubmit={form.handleSubmit(props.onSubmit)}>
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                type="password"
                id="reset-password-form-password"
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
                      .filter((item) => item.param === "password")
                      .map((item) => new Error(item.message || "")),
                  ]}
                />
              )}
            </Field>
          )}
        />
        <Controller
          name="re_password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                id="reset-password-form-re_password"
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Confirm password"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
              {props.serverErrors && (
                <FieldError
                  errors={[
                    ...(props.serverErrors.errors || [])
                      .filter((item) => item.param === "re_password")
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
          {props.pending ? "Resetting password..." : "Reset password"}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ResetPasswordForm;
