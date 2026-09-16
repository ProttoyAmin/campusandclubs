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
import type { DepartmentTemplate, InstituteAffiliateForUser } from "@campus/api";
import RenderDepartmentsComboboxField from "./render-departments-field";

type ClubCreateFormProps = {
  onSubmit: (data: ClubCreateSchemaType) => void;
  affiliations: Array<InstituteAffiliateForUser>;
  templates: DepartmentTemplate[] | undefined;
  isPending?: boolean;
};

type Step = 1 | 2 | 3 | 4;

const ClubCreateForm = (props: ClubCreateFormProps) => {
  const [step, setStep] = React.useState<Step>(1);

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

  const clubTemplatesWithLabel = React.useMemo(() => {
    return props.templates?.map((template) => ({
      value: template.id,
      label: template.name,
    })) || [];
  }, [props.templates]);

  const handleNext = React.useCallback(() => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as Step);
    }
  }, [step]);

  const handleBack = React.useCallback(() => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  }, [step]);

  const handleSubmit = React.useCallback((data: ClubCreateSchemaType) => {
    props.onSubmit(data);
  }, [props.onSubmit]);

  const renderStepContent = React.useCallback(() => {
    switch (step) {
      case 1:
        return (
          <>
            <Controller
              name="origin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Origin</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={undefined}
                    disabled={!props.affiliations || props.affiliations.length === 0}
                  >
                    <SelectTrigger
                      id="origin"
                      aria-invalid={fieldState.invalid}
                      className="min-w-30"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectSeparator />
                      {props.affiliations?.map((affiliation) => (
                        <SelectItem key={affiliation.id} value={affiliation.id}>
                          {`${formatLabel(affiliation.institute.name)} (${affiliation.institute.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!props.affiliations || props.affiliations.length === 0) && (
                    <>
                      <FieldLabel className="text-xs text-orange-400">
                        You need to join an institute to create a club with an origin. You can claim one from the settings page.
                      </FieldLabel>
                      <FieldLabel className="text-xs text-orange-400">
                        Clubs with no origin will be treated as a Local club.
                      </FieldLabel>
                    </>
                  )}
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
          </>
        );

      case 2:
        return (
          <>
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
          </>
        );

      case 3:
        return (
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
        );

      case 4:
        return (
          <>
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
          </>
        );

      default:
        return null;
    }
  }, [step, form.control, props.affiliations, clubTemplatesWithLabel]);

  const renderStepButtons = React.useCallback(() => {
    const isFirstStep = step === 1;
    const isLastStep = step === 4;

    return (
      <Field orientation="horizontal" className="mt-4">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {isFirstStep && (
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        )}
        {!isLastStep ? (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button type="submit" form={formId} disabled={props?.isPending}>
            {props?.isPending ? (
              <>
                <Spinner />
                <p>Creating...</p>
              </>
            ) : (
              <p>Create Club</p>
            )}
          </Button>
        )}
      </Field>
    );
  }, [step, handleBack, handleNext, form, formId, props.isPending]);

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex-1 h-1 rounded-full transition-colors ${stepNumber <= step ? 'bg-accent' : 'bg-gray-200'
                }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="space-y-4">
          {renderStepContent()}
        </div>

        {/* Step buttons */}
        {renderStepButtons()}
      </FieldGroup>
    </form>
  );
};

export default React.memo(ClubCreateForm);