import React from "react";
import { Input } from "design/components/ui/input";
import { clubCreateSchema } from "validation/club";
import {
  type ClubCreateSchemaType,
  Privacy,
  JoinMode,
  Scope,
  PrivacyOptions,
  ScopeOptions,
  JoinModeOptions,
} from "validation/club";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "design/components/ui/field";
import { useComponentId } from "@/shared/hooks/id";
import { Textarea } from "design/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "design/components/ui/select";
import { formatLabel } from "@/utils/format-label";
import { Button } from "design/components/ui/button";
import { Spinner } from "design/components/ui/spinner";
import type { DepartmentTemplate, Institute } from "@campus/api";
import RenderDepartmentsComboboxField from "./render-departments-field";

type ClubCreateFormProps = {
  onSubmit: (data: ClubCreateSchemaType) => void;
  institutes: Pick<Institute, "id" | "name" | "code">[] | undefined;
  templates: DepartmentTemplate[] | undefined;
  isPending?: boolean;
};

const ClubCreateForm = (props: ClubCreateFormProps) => {
  const form = useForm<ClubCreateSchemaType>({
    resolver: zodResolver(clubCreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      privacy: Privacy.Public,
      about: "",
      scope: Scope.Global,
      join_mode: JoinMode.Instant,
      avatar: null,
      banner: null,
      department_templates: [],
      origin: "",
    },
  });

  const formId = useComponentId("create-club");
  const clubTemplatesWithLabel = props.templates.map((template) => ({
    value: template.id,
    label: template.name,
  }));

  return (
    <form id={formId} onSubmit={form.handleSubmit(props.onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                id="name"
                aria-invalid={fieldState.invalid}
                placeholder="Name"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="about"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Textarea
                {...field}
                id="about"
                aria-invalid={fieldState.invalid}
                placeholder="About"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="scope"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Scope</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="scope"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectSeparator />
                  {ScopeOptions.map((scope) => (
                    <SelectItem key={scope} value={scope}>
                      {formatLabel(scope)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="privacy"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Privacy</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="privacy"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectSeparator />
                  {PrivacyOptions.map((privacy) => (
                    <SelectItem key={privacy} value={privacy}>
                      {formatLabel(privacy)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="join_mode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Join Mode</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="join_mode"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectSeparator />
                  {JoinModeOptions.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {formatLabel(mode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="department_templates"
          control={form.control}
          render={({ field, fieldState }) => (
            <RenderDepartmentsComboboxField
              form={form}
              field={field}
              fieldState={fieldState}
              clubTemplatesWithLabel={clubTemplatesWithLabel}
            />
          )}
        />
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form={formId} disabled={props?.isPending}>
            {props?.isPending ? (
              <>
                <Spinner />
                <p>Creating...</p>
              </>
            ) : (
              <p>Continue</p>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default React.lazy(() => Promise.resolve({ default: ClubCreateForm }));
