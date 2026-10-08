import { useUpdateClub } from '@/features/club/hooks/club.hooks';
import type { JoinMode, Privacy } from 'validation/club';
import { toast } from 'design/components/ui/toast';
import { useClubOutlet } from '@/features/club/context/club-layout-context';
import PrivacySecurityForm, { type PrivacySecurityFormHandle } from '@/features/club/components/forms/privacy-security-form';
import ConfirmationBarBottom from '@/shared/components/confirmation-bar-bottom';
import { useRef, useState } from 'react';



const ClubPrivacySettings = () => {
    const { club } = useClubOutlet();
    const { updatePrivacyJoinMode } = useUpdateClub(club.slug);
    const updatePrivacyJoinModeSettings = updatePrivacyJoinMode(club.id || '')
    const formRef = useRef<PrivacySecurityFormHandle>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const showBar = isDirty || isExiting;

    const handleCancel = () => {
        setIsExiting(true);
    };

    const handleBarAnimationEnd = () => {
        if (isExiting) {
            formRef.current?.reset();
            setIsExiting(false);
        }
    };

    const handleSubmit = (data: { privacy: Privacy, join_mode: JoinMode }) => {
        console.log("Form submitted successfully:", data);

        updatePrivacyJoinModeSettings.mutateAsync(data, {
            onSuccess: () => {
                toast.add({
                    title: "Club settings updated successfully",
                    type: "success",
                });
            },
            onError: (error) => {
                toast.add({ title: error.response.data.detail, type: "error" });
            },
        });
    };
    return (
        <div className='relative min-h-full min-w-2xl'>
            <PrivacySecurityForm
                onSubmit={handleSubmit}
                pending={updatePrivacyJoinModeSettings.isPending}
                onDirtyChange={setIsDirty}
                formRef={formRef}
            />
            {showBar && (
                <ConfirmationBarBottom
                    isExiting={isExiting}
                    onCancel={handleCancel}
                    onConfirm={() => formRef.current?.submit()}
                    onAnimationEnd={handleBarAnimationEnd}
                    confirmDisabled={updatePrivacyJoinModeSettings.isPending}
                />
            )}
        </div>
    )
}

export default ClubPrivacySettings