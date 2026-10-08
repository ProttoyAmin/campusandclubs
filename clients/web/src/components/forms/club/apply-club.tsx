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
import { Input } from "design/components/ui/input";

export type QuestionType = "short_text" | "long_text" | "phone" | "email" | "file";

export type Question = {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
};

type ClubApplicationProps = {
  onSubmit: (data: MembershipApplicationCreateRequest) => void;
  questions: Question[] | [];
  setAnswers: React.Dispatch<React.SetStateAction<{ question_id: string; answer: string }[]>>
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
    <form id="apply-club-form" onSubmit={form.handleSubmit(props.onSubmit)}>
      {/* {
        question: "what is your name ?",
        type: "short_text",
        required: true
      } */}
      {!props.questions || props.questions.length === 0 ? (
        <></>
      ) : (
        props.questions.map((q: Question) => {
          return (
            <>
              <Field key={q.id}>
                <FieldLabel htmlFor={`question_${q.id}`}>
                  {q.question}
                </FieldLabel>
                <Input
                  id={`question_${q.id}`}
                  placeholder={q.question}
                  autoComplete="off"
                  onChange={(e) => {
                    props.setAnswers(prev => {
                      const existingAnswer = prev.find(a => a.question_id === q.id);
                      if (existingAnswer) {
                        return prev.map(a => a.question_id === q.id ? { ...a, answer: e.target.value } : a);
                      }
                      return [...prev, { question_id: q.id, answer: e.target.value }];
                    });
                  }}
                />
              </Field>
            </>
          )
        })
      )}
      <FieldGroup>
        <div className="flex gap-2">
          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="apply-club-form-message">
                  Message
                </FieldLabel>
                <Textarea
                  {...field}
                  id="apply-club-form-message"
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
        <Button type="submit" variant="glass" className={'rounded-full'} size="lg">
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ClubApplicationForm;
