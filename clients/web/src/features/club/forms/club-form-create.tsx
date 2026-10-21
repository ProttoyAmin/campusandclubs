import { Controller, useFieldArray, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "design/components/ui/button";
import { Input } from "design/components/ui/input";
import { Checkbox } from "design/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "design/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "design/components/ui/field";

import {
    ApplicationFormCreateSchema,
    toApplicationFormPayload,
    QUESTION_TYPES,
    type ApplicationFormCreateInput,
} from "validation/club";

const CHOICE_TYPES = new Set(["single_choice", "multiple_choice"]);

interface ApplicationFormCreateFormProps {
    onSubmit: (payload: ReturnType<typeof toApplicationFormPayload>) => void;
    isPending?: boolean;
}

const OptionsFieldGroup = ({
    control,
    questionIndex,
}: {
    control: Control<ApplicationFormCreateInput>;
    questionIndex: number;
}) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `questions.${questionIndex}.options` as const,
    });

    return (
        <FieldGroup className="pl-4 gap-2">
            {fields.map((field, optionIndex) => (
                <Controller
                    key={field.id}
                    name={`questions.${questionIndex}.options.${optionIndex}.value` as const}
                    control={control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <div className="flex items-center gap-2">
                                <Input {...field} aria-invalid={fieldState.invalid} placeholder={`Option ${optionIndex + 1}`} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(optionIndex)}>
                                    <Trash2 />
                                </Button>
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            ))}
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => append({ value: "" })}>
                <Plus /> Add option
            </Button>
        </FieldGroup>
    );
};

const ApplicationFormCreateForm = ({ onSubmit, isPending }: ApplicationFormCreateFormProps) => {
    const form = useForm<ApplicationFormCreateInput>({
        resolver: zodResolver(ApplicationFormCreateSchema),
        mode: "onChange",
        defaultValues: {
            title: "",
            questions: [{ question: "", type: "short_text", required: false, options: [] }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    return (
        <form
            id="application-form-create-form"
            onSubmit={form.handleSubmit((data) => onSubmit(toApplicationFormPayload(data)))}
        >
            <FieldGroup className="gap-6">
                <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="application-form-title">Form Title</FieldLabel>
                            <Input
                                {...field}
                                id="application-form-title"
                                aria-invalid={fieldState.invalid}
                                placeholder="Membership Application Form"
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <FieldGroup className="gap-4">
                    {fields.map((questionField, index) => {
                        const type = form.watch(`questions.${index}.type`);
                        return (
                            <FieldGroup key={questionField.id} className="rounded-md border p-4 gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <Controller
                                        name={`questions.${index}.question`}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid} className="flex-1">
                                                <FieldLabel htmlFor={`question-${index}`}>Question {index + 1}</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={`question-${index}`}
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="What is your name?"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mt-6"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Controller
                                        name={`questions.${index}.type`}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid} className="flex-1">
                                                <FieldLabel htmlFor={`question-${index}-type`}>Type</FieldLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger id={`question-${index}-type`} aria-invalid={fieldState.invalid}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {QUESTION_TYPES.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name={`questions.${index}.required`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <Field className="flex flex-row items-center gap-2 pt-6">
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                <FieldLabel>Required</FieldLabel>
                                            </Field>
                                        )}
                                    />
                                </div>

                                {CHOICE_TYPES.has(type) && (
                                    <OptionsFieldGroup control={form.control} questionIndex={index} />
                                )}
                            </FieldGroup>
                        );
                    })}
                </FieldGroup>

                <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    onClick={() =>
                        append({ question: "", type: "short_text", required: false, options: [] })
                    }
                >
                    <Plus /> Add question
                </Button>

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Form"}
                </Button>
            </FieldGroup>
        </form>
    );
};

export default ApplicationFormCreateForm;