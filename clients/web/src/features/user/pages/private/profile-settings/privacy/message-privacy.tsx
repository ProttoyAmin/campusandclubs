import NavigateButtons from '@/shared/components/navigate-buttons';
import { usePageHeader } from '@/shared/hooks/use-page-header';
import { RadioGroup, RadioGroupItem } from 'design/components/ui/radio-group';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
} from "design/components/ui/field"
import React from 'react';
import { useSettingsOutlet } from '@/features/user/context/user-layout-context';

interface MessagePrivacyOption {
    value: string;
    label: string;
    description: string;
}

const options: MessagePrivacyOption[] = [
    {
        value: "everyone",
        label: "Everyone",
        description: "Everyone can message you. Including people who don't follow you.",
    },
    {
        value: "followers",
        label: "Followers",
        description: "Only followers can message you. Including people who don't follow you.",
    },
    {
        value: "mutual",
        label: "Mutual",
        description: "Only mutual followers can message you.",
    },
    {
        value: "none",
        label: "No one",
        description: "No one can message you.",
    },
];

const MessagePrivacy = () => {
    const pageHeader = usePageHeader();
    const [messagePrivacy, setMessagePrivacy] = React.useState<string>('none');
    React.useEffect(() => {
        const id = pageHeader.push(
            <>
                <div className="flex items-center gap-4">
                    <NavigateButtons
                        hideForward
                    />
                    <h1 className="text-lg font-semibold">Messages</h1>
                </div>
            </>
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);
    return (
        <div className='h-[calc(100vh-9rem)]'>
            <RadioGroup defaultValue={messagePrivacy} className="w-fit" onValueChange={(value) => {
                console.log(value)
                setMessagePrivacy(value)
            }}>
                {options.map((option) => (
                    <Field orientation="horizontal" key={option.value}>
                        <RadioGroupItem value={option.value} id={option.value} />
                        <FieldContent>
                            <FieldLabel htmlFor={option.value}>{option.label}</FieldLabel>
                            <FieldDescription>
                                {option.description}
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                ))}
            </RadioGroup>
        </div>
    )
}

export default MessagePrivacy