import { Controller, useForm } from "react-hook-form";
import { signInSchema, type SignInSchemaType } from "validation/auth";
import { CardContent, CardHeader, CardTitle } from "design/components/ui/card";
import { Input } from "design/components/ui/input";
import { Button } from "design/components/ui/button";
import { Spinner } from "design/components/ui/spinner";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "design/components/ui/field";
import { Link } from "react-router-dom";
import type { AllauthError } from "../../api/auth.client";
import { zodResolver } from "@hookform/resolvers/zod";

type SignInFormProps = {
  onSubmit: (data: SignInSchemaType) => void;
  serverErrors?: AllauthError | null;
  pending: boolean;
};

const SignInForm = (props: SignInFormProps) => {
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <CardContent>
      <CardHeader>
        <CardTitle className="text-center">Sign In</CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(props.onSubmit)}>
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-in-form-username_or_email">
                  Username
                </FieldLabel>
                <Input
                  {...field}
                  id="username_or_email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Username or Email"
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
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-in-form-password">
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
                        .filter((item) => item.param === "password")
                        .map((item) => new Error(item.message || "")),
                    ]}
                  />
                )}
              </Field>
            )}
          />
          <Link
            className="text-sm hover:underline text-right"
            to="../@/auth/sign-up"
          >
            Don't have an account?
          </Link>
          <Button type="submit" disabled={props.pending}>
            {props.pending && (
              <Spinner className="size-4" data-icon="inline-start" />
            )}
            {props.pending ? "Signing in..." : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
    </CardContent>
  );
};

export default SignInForm;
