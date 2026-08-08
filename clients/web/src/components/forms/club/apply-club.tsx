import { applyClubSchema } from "validation/club";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MembershipApplicationCreateRequest } from "@campus/api";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "design/components/ui/field";
import { Button } from "design/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "design/components/ui/textarea";

type ClubApplicationProps = {
  onSubmit: (data: MembershipApplicationCreateRequest) => void;
};

const ClubApplicationForm = (props: ClubApplicationProps) => {
  const form = useForm<MembershipApplicationCreateRequest>({
    resolver: zodResolver(applyClubSchema),
    mode: "onChange",
    defaultValues: {
      message: "I want to join this club",
    },
  });
  return (
    <form id="profile-update-form" onSubmit={form.handleSubmit(props.onSubmit)}>
      <FieldGroup>
        <div className="flex gap-2">
          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="club-application-form-message">
                  Message
                </FieldLabel>
                <Textarea
                  {...field}
                  id="message"
                  aria-invalid={fieldState.invalid}
                  placeholder="I want to join this club"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <Button type="submit">{form.formState.isSubmitting ? "Submitting..." : "Submit"}</Button>
      </FieldGroup>
    </form>
  );
};

export default ClubApplicationForm;
