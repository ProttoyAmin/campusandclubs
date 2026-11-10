import { Controller, useForm } from "react-hook-form";
import { signInSchema, type SignInSchemaType } from "validation/auth";
import { CardAction, CardContent } from "design/components/ui/card";
import { Input } from "design/components/ui/input";
import { Button } from "design/components/ui/button";
import { Spinner } from "design/components/ui/spinner";
import { Separator } from "design/components/ui/separator";
import { Field, FieldError, FieldGroup } from "design/components/ui/field";
import type { AllauthError, LoginRequest } from "../../api/auth.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { routes } from "@/settings/routes";
import googleIconLogo from "../../../../assets/google-icon-logo.svg";
import { useSocials } from "@/features/auth/hooks/session.hook";
import { Link } from "react-router-dom";
import PasswordInput from "@/shared/components/password-input";

type SignInFormProps = {
  onSubmit: (data: LoginRequest) => void;
  serverErrors?: AllauthError | null;
  pending: boolean;
};


const SignInForm = (props: SignInFormProps) => {
  const { socialLogin } = useSocials();
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  return (
    <CardContent>
      <form onSubmit={form.handleSubmit(props.onSubmit)}>
        <FieldGroup>
          <Controller
            name="login"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id="username_or_email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Username or Email"
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
              <Field data-invalid={fieldState.invalid} className="w-full">
                <PasswordInput field={field} fieldState={fieldState} />
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
          {props.serverErrors && (
            <FieldError
              errors={[
                ...(props.serverErrors.errors || [])
                  .map((item) => new Error(item.message || "")),
              ]}
            />
          )}
          <CardAction className="flex justify-between w-full">
            <Link
              to={routes.auth.private.forgot_password}
              className={"place-items-end-safe text-primary cursor-pointer w-fit transition-all duration-200 border-b border-transparent hover:border-b hover:border-primary/50"}
            >
              Forgotten password?
            </Link>
            <Link
              to={routes.auth.public.sign_up}
              className={"place-items-end-safe text-primary cursor-pointer w-fit transition-all duration-200 border-b border-transparent hover:border-b hover:border-primary/50"}
            >
              Sign up
            </Link>
          </CardAction>
          <Button
            type="submit"
            variant="glass"
            className={"rounded-full"}
            size="lg"
            disabled={props.pending}
          >
            {props.pending && (
              <Spinner className="size-4" data-icon="inline-start" />
            )}
            {props.pending ? "Signing in..." : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
      <Separator className="my-4" />
      <div className="flex flex-col gap-2 items-center">
        <Button
          type="button"
          variant="glass"
          className={"rounded-full w-full"}
          size="lg"
          disabled={props.pending || socialLogin.isPending}
          onClick={() => {
            socialLogin.mutate("google");
          }}
        >
          {socialLogin.isPending ? (
            <Spinner className="size-4" data-icon="inline-start" />
          ) : (
            <img
              src={googleIconLogo}
              alt=""
              className="mr-2"
              width={14}
              height={14}
            />
          )}
          {socialLogin.isPending ? "Connecting to Google..." : "Google"}
        </Button>
      </div>
    </CardContent>
  );
};

export default SignInForm;
