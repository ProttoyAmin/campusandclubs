import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Plus } from "lucide-react";

import { Field, FieldError, FieldGroup } from "design/components/ui/field";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxList,
} from "design/components/ui/combobox";
import { Button } from "design/components/ui/button";
import { Input } from "design/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "design/components/ui/select";
import { Spinner } from "design/components/ui/spinner";
import {
  AffiliationClaimSchema,
  roleEnum,
  type AffiliationClaimInput,
} from "validation/institute";
import type { Institute, UserEmail } from "@campus/api";
import { formatLabel } from "@/utils/format-label";
import { useComponentId } from "@/shared/hooks/id";

type ClaimAffiliationFormProps = {
  institutes: Pick<Institute, "id" | "name" | "code">[];
  emails: UserEmail[];
  onSubmit: (data: AffiliationClaimInput) => void;
  isPending?: boolean;
  serverErrors?: Record<string, string[]>;
};

const ClaimAffiliationForm = ({
  institutes,
  emails,
  onSubmit,
  isPending,
  serverErrors,
}: ClaimAffiliationFormProps) => {
  const form = useForm<AffiliationClaimInput>({
    resolver: zodResolver(AffiliationClaimSchema),
    mode: "onChange",
    defaultValues: {
      institute: "",
      email: undefined as unknown as string,
      role: undefined as unknown as AffiliationClaimInput["role"],
      password: "",
    },
  });

  // useServerErrors(serverErrors, form.setError);
  const formId = useComponentId("claim-affiliation-form");

  // Only verified emails are accepted by the backend.
  const verifiedEmails = emails.filter((e) => e.verified);

  const instituteList = institutes.map((institute) => ({
    id: institute.id,
    label: `${institute.name} (${institute.code})`,
  }));

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <FieldGroup>
        {/* Institute typeahead */}
        <Controller
          name="institute"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Combobox
                items={instituteList}
                itemToStringValue={(item) => item?.label ?? ""}
                value={instituteList.find((i) => i.id === field.value) ?? null}
                onValueChange={(item) => field.onChange(item?.id ?? "")}
              >
                <ComboboxInput placeholder="Select an institute" />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: { id: string; label: string }) => (
                      <ComboboxItem key={item.id} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {serverErrors && (
                <FieldError
                  errors={[
                    ...(serverErrors["institute"] || []).map(
                      (item) => new Error(item || ""),
                    ),
                  ]}
                />
              )}
            </Field>
          )}
        />

        {/* Role */}
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                name={field.name}
              >
                <SelectTrigger
                  id="claim-affiliation-role"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roleEnum.map((role) => {
                    return (
                      <SelectItem key={role} value={role}>
                        {formatLabel(role)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {serverErrors && (
                <FieldError
                  errors={[
                    ...(serverErrors["role"] || []).map(
                      (item) => new Error(item || ""),
                    ),
                  ]}
                />
              )}
            </Field>
          )}
        />

        {/* Email (verified allauth addresses) */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => {
                  console.log("v", v);
                  field.onChange(v);
                }}
                name={field.name}
              >
                <SelectTrigger
                  id="claim-affiliation-email"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Pick a verified email" />
                </SelectTrigger>
                <SelectContent>
                  {verifiedEmails.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      You have no verified emails.
                    </div>
                  ) : (
                    verifiedEmails.map((e) => (
                      <SelectItem key={e.id} value={String(e.email)}>
                        {e.email}
                        {e.primary ? " · primary" : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {serverErrors && (
                <FieldError
                  errors={[
                    ...(serverErrors["email"] || []).map(
                      (item) => new Error(item || ""),
                    ),
                  ]}
                />
              )}
            </Field>
          )}
        />

        {/* Password confirmation */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                id="claim-affiliation-password"
                type="password"
                autoComplete="current-password"
                placeholder="Your account password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {serverErrors && (
                <FieldError
                  errors={[
                    ...(serverErrors["password"] || []).map(
                      (item) => new Error(item || ""),
                    ),
                  ]}
                />
              )}
            </Field>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Spinner /> Sending verification email…
            </>
          ) : (
            <>
              <Plus /> Claim affiliation
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ClaimAffiliationForm;
