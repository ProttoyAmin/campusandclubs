// validation/club.ts
import { z } from "zod";

export const QUESTION_TYPES = [
    { value: "short_text", label: "Short Text" },
    { value: "long_text", label: "Long Text" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "url", label: "URL" },
    { value: "single_choice", label: "Single Choice" },
    { value: "multiple_choice", label: "Multiple Choice" },
] as const;

const CHOICE_TYPES = new Set(["single_choice", "multiple_choice"]);

const questionTypeEnum = z.enum([
    "short_text",
    "long_text",
    "number",
    "email",
    "url",
    "single_choice",
    "multiple_choice",
]);

const questionSchema = z
    .object({
        question: z.string().min(1, "Question text is required"),
        type: questionTypeEnum,
        required: z.boolean(),
        // array of objects — required for useFieldArray to work at all
        options: z.array(z.object({ value: z.string().min(1, "Option can't be empty") })),
    })
    .superRefine((data, ctx) => {
        if (CHOICE_TYPES.has(data.type) && data.options.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Add at least 2 options for a choice question",
                path: ["options"],
            });
        }
    });

export const ApplicationFormCreateSchema = z.object({
    title: z.string().min(1, "Form title is required"),
    questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export type ApplicationFormCreateInput = z.infer<typeof ApplicationFormCreateSchema>;

export function toApplicationFormPayload(values: ApplicationFormCreateInput) {
    return {
        title: values.title,
        questions: values.questions.map((q) =>
            CHOICE_TYPES.has(q.type)
                ? { question: q.question, type: q.type, required: q.required, options: q.options.map((o) => o.value) }
                : { question: q.question, type: q.type, required: q.required }
        ),
    };
}