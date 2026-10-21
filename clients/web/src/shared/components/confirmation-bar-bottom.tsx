import { CheckIcon, XIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from 'design/components/ui/button';
import { cn } from 'design/lib/utils';

type ConfirmationBarBottomProps = {
    /** Controls the exit animation. When true, plays slideOutDown. */
    isExiting: boolean;
    /** Called when the cancel (X) button is clicked. */
    onCancel: () => void;
    /** Called when the confirm (✓) button is clicked. */
    onConfirm: () => void;
    /** Called when the bounce-out animation finishes, so the parent can clean up state. */
    onAnimationEnd: () => void;
    /** Optional count to display (e.g. "3 selected"). */
    selectedCount?: number;
    /** Label shown after the count. Defaults to "selected". */
    selectedLabel?: string;
    /** Disables the confirm button (e.g. while a mutation is pending). */
    confirmDisabled?: boolean;
    /** Extra content rendered after the confirm/cancel buttons (e.g. a dropdown menu). */
    children?: React.ReactNode;
}

const ConfirmationBarBottom = ({
    isExiting,
    onCancel,
    onConfirm,
    onAnimationEnd,
    selectedCount,
    selectedLabel = 'selected',
    confirmDisabled,
    children,
}: ConfirmationBarBottomProps) => {
    return (
        <div
            onAnimationEnd={onAnimationEnd}
            className={cn(
                "absolute bottom-4 right-1/2 translate-x-1/2 z-50",
                "bg-background rounded-full px-3 py-2 shadow-md border",
                "flex items-center gap-4",
                isExiting
                    ? "animate-[slideOutDown_0.3s_ease-out]"
                    : "animate-[slideInUp_0.3s_ease-out]",
            )}
        >
            {selectedCount !== undefined && (
                <span className='text-muted-foreground pl-2'>
                    {selectedCount} {selectedLabel}
                </span>
            )}
            <div className='flex gap-1 items-center'>
                <Button
                    variant="glass"
                    disabled={isExiting || confirmDisabled}
                    onClick={onConfirm}
                    className='rounded-full'
                    size='icon-lg'
                >
                    <HugeiconsIcon icon={CheckIcon} />
                </Button>
                <Button
                    variant="destructive"
                    onClick={onCancel}
                    className='rounded-full'
                    size='icon-lg'
                >
                    <HugeiconsIcon icon={XIcon} />
                </Button>
                {children}
            </div>
        </div>
    )
}

export default ConfirmationBarBottom