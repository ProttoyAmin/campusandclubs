import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "design/components/ui/field";
import { Input } from "design/components/ui/input";
import { updateProfileSchema } from "validation/user";
import type { UserProfile } from "@campus/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "design/components/ui/select";
import { Textarea } from "design/components/ui/textarea";
import { Button } from "design/components/ui/button";

type ProfileUpdateProps = {
  onSubmit: (data: z.infer<typeof updateProfileSchema>) => void;
};

const ProfileUpdateForm = (
  props: ProfileUpdateProps & { data: UserProfile },
) => {
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: props.data.first_name || "",
      last_name: props.data.last_name || "",
      gender: props.data.gender || null,
      bio: props.data.bio || "",
      is_private: props.data.is_private || false,
    },
  });

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ] as const;

  return (
    <form id="profile-update-form" onSubmit={form.handleSubmit(props.onSubmit)}>
      <FieldGroup>
        <div className="flex gap-2">
          <Controller
            name="first_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-update-form-first_name">
                  First Name
                </FieldLabel>
                <Input
                  {...field}
                  id="first_name"
                  aria-invalid={fieldState.invalid}
                  placeholder="First Name"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="last_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-update-form-last_name">
                  Last Name
                </FieldLabel>
                <Input
                  {...field}
                  id="last_name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Last Name"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <Controller
          name="gender"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-update-form-gender">
                Identity
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="profile-update-form-gender"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectSeparator />
                  {genderOptions.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-update-form-bio">Bio</FieldLabel>
              <Textarea
                {...field}
                id="profile-update-form-bio"
                aria-invalid={fieldState.invalid}
                placeholder="Bio goes here..."
                className="min-h-30"
                maxLength={300}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="profile-update-form">
            Save
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default ProfileUpdateForm;
