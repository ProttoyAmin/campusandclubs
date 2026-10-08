import {
    clubPrivacySecuritySchema,
    type ClubSettingsRequest,
    type ClubPrivacySecurityRequestInput,
    PrivacyOptions,
    JoinModeOptions,
} from "validation/club";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "design/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { formatLabel } from "@/utils/format-label";
import { useComponentId } from "@/shared/hooks/id";
import { RadioGroup, RadioGroupItem } from "design/components/ui/radio-group"
import { useEffect, useImperativeHandle, type Ref } from "react";

export type PrivacySecurityFormHandle = {
    submit: () => void;
    reset: () => void;
};

type PrivacySecurityFormProps = {
    onSubmit: (data: ClubPrivacySecurityRequestInput) => void;
    pending: boolean;
    onDirtyChange?: (isDirty: boolean) => void;
    formRef?: Ref<PrivacySecurityFormHandle>;
};

const PrivacySecurityForm = (props: PrivacySecurityFormProps) => {
    const { club } = useClubOutlet();
    const formId = useComponentId("settings-form");

    const form = useForm<Pick<ClubSettingsRequest, "privacy" | "join_mode">>({
        resolver: zodResolver(clubPrivacySecuritySchema),
        mode: "onChange",
        values: {
            join_mode: club.join_mode,
            privacy: club.privacy,
        },
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = form;

    useEffect(() => {
        props.onDirtyChange?.(isDirty);
    }, [isDirty]);

    useImperativeHandle(props.formRef, () => ({
        submit: () => handleSubmit(props.onSubmit)(),
        reset: () => reset(),
    }), [handleSubmit, props.onSubmit, reset]);

    return (
        <form id={formId} onSubmit={handleSubmit(props.onSubmit)}>
            <FieldGroup>
                <Controller
                    name="privacy"
                    control={control}
                    render={({ field }) => (
                        <>
                            <FieldLabel>Privacy</FieldLabel>
                            <FieldDescription className="text-orange-400">
                                Your club privacy is how we manage the visibility of your club.
                            </FieldDescription>
                            <RadioGroup value={field.value} onValueChange={field.onChange} aria-labelledby={field.name}>
                                {PrivacyOptions.map((privacy) => (
                                    <>
                                        <FieldLabel htmlFor={privacy}>
                                            <Field key={privacy} orientation="horizontal" className={'rounded-xl'} >
                                                <FieldContent>
                                                    <FieldTitle>{formatLabel(privacy)}</FieldTitle>
                                                    {/* <FieldDescription>
                                                        For individuals and small teams.
                                                    </FieldDescription> */}
                                                </FieldContent>
                                                <RadioGroupItem value={privacy} id={privacy} />
                                            </Field></FieldLabel>
                                    </>
                                ))}
                            </RadioGroup>
                            {errors.privacy && (
                                <FieldError errors={[errors.privacy]} />
                            )}
                        </>
                    )}
                />


                <Controller
                    name="join_mode"
                    control={control}
                    render={({ field }) => (
                        <>
                            <FieldLabel>Join Mode</FieldLabel>
                            <FieldDescription className="text-orange-400">
                                Join mode depends on how your privacy settings are. For example, if your club is private, then you can only join the club through application or invitation. Secret clubs should always be invite only.
                            </FieldDescription>
                            <RadioGroup value={field.value} onValueChange={field.onChange} aria-labelledby={field.name}>
                                {JoinModeOptions.map((join_mode) => (
                                    <>
                                        <FieldLabel htmlFor={join_mode}>
                                            <Field key={join_mode} orientation="horizontal" className={'rounded-xl'}>
                                                <FieldContent>
                                                    <FieldTitle>{formatLabel(join_mode)}</FieldTitle>
                                                    {/* <FieldDescription>
                                                        For individuals and small teams.
                                                    </FieldDescription> */}
                                                </FieldContent>
                                                <RadioGroupItem value={join_mode} id={join_mode} />
                                            </Field></FieldLabel>
                                    </>
                                ))}
                            </RadioGroup>
                            {errors.join_mode && (
                                <FieldError errors={[errors.join_mode]} />
                            )}
                        </>
                    )}
                />

            </FieldGroup>
        </form>
    );
};

export default PrivacySecurityForm;
