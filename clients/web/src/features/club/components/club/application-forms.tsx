import React from "react";
import { Sortable, SortableItem, DragHandle } from "design/components/ui/sortable";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "design/components/ui/card";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "design/components/ui/accordion";
import { Badge } from "design/components/ui/badge";

import { QUESTION_TYPES } from "validation/club";
import { Button } from "design/components/ui/button";

interface Question {
    question: string;
    type: string;
    required: boolean;
    order: number;
    options?: string[];
}

interface ApplicationForm {
    id: number;
    object_id: string;
    title: string;
    is_active: boolean;
    questions: Question[];
    created_at: string;
    updated_at: string;
}

interface ApplicationFormsShowcaseProps {
    forms: ApplicationForm[];
}

type QuestionRow = Question & { _rowId: string };

const typeLabel = (value: string) =>
    QUESTION_TYPES.find((t) => t.value === value)?.label ?? value;


// features/club/components/application-forms-showcase.tsx (only FormQuestionsSortable changes)
const FormQuestionsSortable = ({
    formId,
    formTitle,
    initialQuestions,
}: {
    formId: number;
    formTitle: string;
    initialQuestions: Question[];
}) => {
    const [rowsById, setRowsById] = React.useState<Record<string, QuestionRow>>(() => {
        const sorted = [...initialQuestions].sort((a, b) => a.order - b.order);
        return Object.fromEntries(
            sorted.map((q) => {
                const _rowId = crypto.randomUUID();
                return [_rowId, { ...q, _rowId }];
            })
        );
    });
    const [order, setOrder] = React.useState<string[]>(() => Object.keys(rowsById));

    const handleReorder = (nextOrder: (string | number)[]) => {
        const ids = nextOrder as string[];
        setOrder(ids);

        const reordered = ids.map((id, i) => ({ ...rowsById[id], order: i + 1 }));
        setRowsById(Object.fromEntries(reordered.map((r) => [r._rowId, r])));

        console.log("PUT application form (reorder)", {
            method: "PUT",
            formId,
            body: {
                title: formTitle,
                questions: reordered.map(({ _rowId, ...q }) => q),
            },
        });
    };

    return (
        <Sortable ids={order} onReorder={handleReorder}>
            <div className="flex flex-col gap-2">
                {order.map((id, index) => {
                    const row = rowsById[id];
                    return (
                        <SortableItem key={id} id={id} index={index}>
                            {({ ref, handleRef, isDragging }) => (
                                <div
                                    ref={ref}
                                    style={{ opacity: isDragging ? 0.5 : 1 }}
                                    className="flex items-center gap-3 rounded-md border bg-background p-3"
                                >
                                    <DragHandle ref={handleRef} />
                                    <div className="flex flex-1 flex-col gap-1">
                                        <span className="text-sm font-medium">{row.question}</span>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{typeLabel(row.type)}</span>
                                            {row.required && <Badge variant="outline">Required</Badge>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SortableItem>
                    );
                })}
            </div>
        </Sortable>
    );
};

const ApplicationFormsShowcase = ({ forms }: ApplicationFormsShowcaseProps) => {
    return (
        <div className="flex flex-col gap-4">
            {forms?.map((form) => (
                <Card key={form.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{form.title}</CardTitle>
                            <CardDescription>{form.questions?.length} questions</CardDescription>
                        </div>
                        <Badge variant={form.is_active ? "default" : "secondary"}>
                            {form.is_active ? "Active" : (
                                <>
                                    <Button>
                                        Make Active
                                    </Button>
                                </>
                            )}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <Accordion defaultValue={[String(form.id)]}>
                            <AccordionItem value={String(form.id)}>
                                <AccordionTrigger>View & reorder questions</AccordionTrigger>
                                <AccordionContent>
                                    <FormQuestionsSortable
                                        formId={form.id}
                                        formTitle={form.title}
                                        initialQuestions={form.questions || []}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ApplicationFormsShowcase;