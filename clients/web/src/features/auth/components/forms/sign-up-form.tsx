import React from "react";
import { Controller, useForm } from "react-hook-form";
import { signUpSchema, type SignUpSchemaType } from "validation/auth";
import { CardContent, CardHeader, CardTitle } from "design/components/ui/card";
import { Input } from "design/components/ui/input";
import { Button } from "design/components/ui/button";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "design/components/ui/field";
import { Link } from "react-router-dom";
import { Spinner } from "design/components/ui/spinner";
import type { SignUpError } from "../../api/auth.client";
import { zodResolver } from "@hookform/resolvers/zod";

type SignUpFormProps = {
  onSubmit: (data: SignUpSchemaType) => void;
  pending: boolean;
  serverErrors?: SignUpError;
};

const SignUpForm: React.FC<SignUpFormProps> = (props: SignUpFormProps) => {
  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      re_password: "",
    },
  });

  return (
    <CardContent className="">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(props.onSubmit)} className="">
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-form-username">
                  Username
                </FieldLabel>
                <Input
                  {...field}
                  id="username"
                  aria-invalid={fieldState.invalid}
                  placeholder="Username"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

                {props.serverErrors && (
                  <FieldError
                    errors={[
                      ...(props.serverErrors.errors || [])
                        .filter((item) => item.param === "username")
                        .map((item) => new Error(item.message || "")),
                    ]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-form-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Email"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

                {props.serverErrors && (
                  <FieldError
                    errors={[
                      ...(props.serverErrors.errors || [])
                        .filter((item) => item.param === "email")
                        .map((item) => new Error(item.message || "")),
                    ]}
                  />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-form-password">
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Password"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                {props.serverErrors && (
                  <FieldError
                    errors={[
                      ...(props.serverErrors.errors || [])
                        .filter((item) => item.param === "password" || item.param === "password1")
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
                <FieldLabel htmlFor="sign-up-form-re_password">
                  Confirm Password
                </FieldLabel>
                <Input
                  {...field}
                  id="re_password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                {props.serverErrors && (
                  <FieldError
                    errors={[
                      ...(props.serverErrors.errors || [])
                        .filter((item) => item.param === "re_password" || item.param === "password2")
                        .map((item) => new Error(item.message || "")),
                    ]}
                  />
                )}
              </Field>
            )}
          />
          <Link
            className="text-sm hover:underline text-right"
            to="../@/auth/sign-in"
          >
            Already have an account?
          </Link>
          <Button type="submit" disabled={props.pending}>
            {props.pending ? (
              <>
                <Spinner className="size-4" /> Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </Button>
        </FieldGroup>
      </form>
    </CardContent>
  );
};

export default SignUpForm;
