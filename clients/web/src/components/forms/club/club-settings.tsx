import {
  clubSettingsSchema,
  type ClubSettingsRequest,
  StatusOptions,
  PrivacyOptions,
  ScopeOptions,
  JoinModeOptions,
} from "validation/club";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "design/components/ui/field";
import { Button } from "design/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "design/components/ui/select";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { formatLabel } from "@/utils/format-label";
import { useComponentId } from "@/shared/hooks/id";
import { Spinner } from "design/components/ui/spinner";

type ClubSettingsFormProps = {
  onSubmit: (data: ClubSettingsRequest) => void;
  pending: boolean;
};

const ClubSettingsForm = (props: ClubSettingsFormProps) => {
  const { club } = useClubOutlet();
  const formId = useComponentId("settings-form");

  const form = useForm<ClubSettingsRequest>({
    resolver: zodResolver(clubSettingsSchema),
    mode: "onChange",
    values: {
      status: club.status,
      join_mode: club.join_mode,
      privacy: club.privacy,
      scope: club.scope,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div>
      <form id={formId} onSubmit={handleSubmit(props.onSubmit)}>
        <FieldGroup>
          <Controller
            name="privacy"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Privacy</FieldLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger onBlur={field.onBlur}>
                    <SelectValue placeholder="Select privacy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Privacy</SelectLabel>
                      {PrivacyOptions.map((privacy) => (
                        <SelectItem key={privacy} value={privacy}>
                          {formatLabel(privacy)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.privacy && <FieldError errors={[errors.privacy]} />}
              </Field>
            )}
          />

          <div className="flex gap-2">
            <Controller
              name="join_mode"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Join Mode</FieldLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger onBlur={field.onBlur}>
                      <SelectValue placeholder="Select join mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Join Mode</SelectLabel>
                        {JoinModeOptions.map((join_mode) => (
                          <SelectItem key={join_mode} value={join_mode}>
                            {formatLabel(join_mode)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.join_mode && (
                    <FieldError errors={[errors.join_mode]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="scope"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Scope</FieldLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger onBlur={field.onBlur}>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Scope</SelectLabel>
                        {ScopeOptions.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {formatLabel(scope)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.scope && <FieldError errors={[errors.scope]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger onBlur={field.onBlur}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      {StatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.status && <FieldError errors={[errors.status]} />}
              </Field>
            )}
          />
          <div className="w-full flex flex-col gap-2">
            <Button type="submit" variant="outline" disabled={props.pending}>
              {props.pending && (
                <Spinner className="size-4" data-icon="inline-start" />
              )}
              {props.pending ? "Saving settings..." : "Save settings"}
            </Button>
            {/* <Button variant="default" type="reset" onClick={() => form.reset()}>
              Reset
            </Button> */}
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};

export default ClubSettingsForm;
