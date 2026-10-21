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

    const getScopeDescription = (scope: string) => {
        switch (scope) {
            case "open":
                return "Open to all";
            case "intra":
                return "Open to people from different affiliations";
            case "exclusive":
                return "Open to people with the same affiliation as the club origin";
        }
    };

    const handleScopeUpdate = (newScope: string) => {
        console.log(newScope);
    }

    return (
        <div className='relative min-h-full flex flex-col gap-2.5'>
            <FieldLabel>Scope</FieldLabel>
            <FieldDescription className={`flex flex-col gap-1.5`}>
                This is the place to decide your club scope. Scope defines how your club wants to operate.
                {!club.origin && (
                    <p className="text-xs text-orange-400">Clubs with no origin cannot be changed from global scope.</p>
                )}
            </FieldDescription>
            <RadioGroup value={scope} onValueChange={setScope}>
                {ScopeOptions.map((option) => (
                    <FieldLabel key={option} htmlFor={option} className={`${!club.origin && option !== "open" ? "text-muted-foreground cursor-not-allowed" : ""}`}>
                        <Field orientation="horizontal" className='rounded-xl'>
                            <FieldContent>
                                <FieldTitle>{formatLabel(option)}</FieldTitle>
                                <FieldDescription>{getScopeDescription(option)}</FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value={option} id={option} disabled={!club.origin && option !== "open"} />
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