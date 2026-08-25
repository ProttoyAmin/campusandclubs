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
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "design/components/ui/spinner";
import type { SignUpError } from "../../api/auth.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "design/components/ui/separator";
import googleIconLogo from "../../../../assets/google-icon-logo.svg";
import facebookIconLogo from "../../../../assets/Facebook-f_Logo-Blue-Logo.wine.svg";

import { useSocials } from "../../hooks/session.hook";

type SignUpFormProps = {
  onSubmit: (data: SignUpSchemaType) => void;
  pending: boolean;
  serverErrors?: SignUpError;
};

const SignUpForm: React.FC<SignUpFormProps> = (props: SignUpFormProps) => {
  const { socialLogin } = useSocials();
  const navigate = useNavigate();
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
      <form onSubmit={form.handleSubmit(props.onSubmit)} className="">
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                {/* <FieldLabel htmlFor="sign-up-form-username">
                  Username
                </FieldLabel> */}
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
                {/* <FieldLabel htmlFor="sign-up-form-email">Email</FieldLabel> */}
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
                {/* <FieldLabel htmlFor="sign-up-form-password">
                  Password
                </FieldLabel> */}
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
                        .filter(
                          (item) =>
                            item.param === "password" ||
                            item.param === "password1",
                        )
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
                {/* <FieldLabel htmlFor="sign-up-form-re_password">
                  Confirm Password
                </FieldLabel> */}
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
                        .filter(
                          (item) =>
                            item.param === "re_password" ||
                            item.param === "password2",
                        )
                        .map((item) => new Error(item.message || "")),
                    ]}
                  />
                )}
              </Field>
            )}
          />
          <Button
            type="button"
            className="place-items-end-safe"
            onClick={() => navigate("../@/auth/sign-in")}
            variant="link"
          >
            Already have an account?
          </Button>
          <Button
            type="submit"
            variant="glass"
            className={"rounded-full"}
            size="lg"
            disabled={props.pending}
          >
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
      <Separator className="my-4" />
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="glass"
          className={"rounded-full w-1/2"}
          size="lg"
          onClick={() => {
            socialLogin.mutate("google");
          }}
        >
          {socialLogin.isPending && (
            <Spinner className="size-4" data-icon="inline-start" />
          )}
          <img
            src={googleIconLogo}
            alt=""
            className="mr-2"
            width={14}
            height={14}
          />{" "}
          Google
        </Button>
        <Button
          type="button"
          variant="glass"
          className={"rounded-full w-1/2"}
          size="lg"
          onClick={() => {
            // socialLogin.mutate("google");
            console.log('facebook login attempt')
          }}
        >
          {socialLogin.isPending && (
            <Spinner className="size-4" data-icon="inline-start" />
          )}
          <img
            src={facebookIconLogo}
            alt=""
            className=""
            width={34}
            height={34}
          />{" "}
          Facebook
        </Button>
      </div>
    </CardContent>
  );
};

export default SignUpForm;
