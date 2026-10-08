import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from "design/components/ui/radio-group"
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { ScopeOptions } from "validation/club";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from 'design/components/ui/field';
import { formatLabel } from '@/utils/format-label';
import ConfirmationBarBottom from '@/shared/components/confirmation-bar-bottom';


const ClubScopeSettings = () => {
    const { club } = useClubOutlet();
    const [scope, setScope] = useState<string>(club.scope || "");
    const [isExiting, setIsExiting] = useState(false);

    const isDirty = scope !== club.scope;
    const showBar = isDirty || isExiting;

    const handleCancel = () => {
        setIsExiting(true);
    };

    const handleBarAnimationEnd = () => {
        if (isExiting) {
            setScope(club.scope || "");
            setIsExiting(false);
        }
    };

    const handleScopeUpdate = (newScope: string) => {
        console.log(newScope);
    }

    return (
        <div className='relative min-h-full flex flex-col gap-2.5'>
            <FieldLabel>Scope</FieldLabel>
            <FieldDescription className="text-orange-400">
                This is the place to decide your club scope. Scope defines how your club wants to operate.
            </FieldDescription>
            <RadioGroup value={scope} onValueChange={setScope}>
                {ScopeOptions.map((option) => (
                    <FieldLabel key={option} htmlFor={option}>
                        <Field orientation="horizontal" className='rounded-xl'>
                            <FieldContent>
                                <FieldTitle>{formatLabel(option)}</FieldTitle>
                            </FieldContent>
                            <RadioGroupItem value={option} id={option} />
                        </Field>
                    </FieldLabel>
                ))}
            </RadioGroup>
            {showBar && (
                <ConfirmationBarBottom
                    isExiting={isExiting}
                    onCancel={handleCancel}
                    onConfirm={() => handleScopeUpdate(scope)}
                    onAnimationEnd={handleBarAnimationEnd}
                />
            )}
        </div>
    )
}

export default ClubScopeSettings