import NavigateButtons from '@/shared/components/navigate-buttons';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import { RadioGroup, RadioGroupItem } from 'design/components/ui/radio-group';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
} from "design/components/ui/field"
import React from 'react'

const OnlineStatusPrivacy = () => {
    const pageHeader = usePageHeader();

    React.useEffect(() => {
        const id = pageHeader.push(
            <>
                <div className="flex items-center gap-4">
                    <NavigateButtons
                        hideForward
                    />
                    <h1 className="text-lg font-semibold">Online Status</h1>
                </div>
            </>
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);
    return (
        <RadioGroup defaultValue="comfortable" className="w-fit">
            <Field orientation="horizontal">
                <RadioGroupItem value="default" id="desc-r1" />
                <FieldContent>
                    <FieldLabel htmlFor="desc-r1">Default</FieldLabel>
                    <FieldDescription>
                        Standard spacing for most use cases.
                    </FieldDescription>
                </FieldContent>
            </Field>
            <Field orientation="horizontal">
                <RadioGroupItem value="comfortable" id="desc-r2" />
                <FieldContent>
                    <FieldLabel htmlFor="desc-r2">Comfortable</FieldLabel>
                    <FieldDescription>More space between elements.</FieldDescription>
                </FieldContent>
            </Field>
            <Field orientation="horizontal">
                <RadioGroupItem value="compact" id="desc-r3" />
                <FieldContent>
                    <FieldLabel htmlFor="desc-r3">Compact</FieldLabel>
                    <FieldDescription>
                        Minimal spacing for dense layouts.
                    </FieldDescription>
                </FieldContent>
            </Field>
        </RadioGroup>
    )
}

export default OnlineStatusPrivacy