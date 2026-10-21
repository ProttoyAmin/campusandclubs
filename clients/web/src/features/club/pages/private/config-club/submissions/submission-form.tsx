import { useApplication } from '@/features/club/hooks/applications.hooks';
import { useClubOutlet } from '@/features/club/context/club-layout-context';
import EmptyState from '@/shared/components/empty-state';
import { HugeiconsIcon } from '@hugeicons/react';
import { FormIcon } from '@hugeicons/core-free-icons';
import { Button } from 'design/components/ui/button';
import ResponsiveDialog from '@/shared/components/responsive-dialog';
import React from 'react';
import ApplicationFormCreateForm from '@/features/club/forms/club-form-create';
import ApplicationFormsShowcase from '@/features/club/components/club/application-forms';


const SubmissionForm = () => {
    const [isFormBuilderOpen, setIsFormBuilderOpen] = React.useState(false);
    const { club } = useClubOutlet();
    if (!club) return null;
    const { applicationForms, createApplicationForm } = useApplication(club.id);
    const clubForms = [];
    if (applicationForms.data) {
        clubForms.push(applicationForms.data);
    }
    const createForm = createApplicationForm()

    if (applicationForms.isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className='flex justify-end'>
                <Button variant='outline' className={'rounded-full text-xs px-4'} onClick={() => {
                    setIsFormBuilderOpen(true);
                }}>
                    Add forms
                </Button>
            </div>
            <ResponsiveDialog
                open={isFormBuilderOpen}
                onOpenChange={setIsFormBuilderOpen}
                title="Create Application Form"
                description="Create a new application form for your club."
            >
                <ApplicationFormCreateForm
                    isPending={createForm.isPending}
                    onSubmit={(payload) =>
                        createForm.mutate(payload, { onSuccess: () => setIsFormBuilderOpen(false) })
                    }
                />
            </ResponsiveDialog>
            {clubForms?.length === 0 ?
                <EmptyState title="No Forms" description={"No application forms are created yet."} icon={<HugeiconsIcon icon={FormIcon} />}
                /> : (
                    <>
                        <pre>{JSON.stringify(clubForms, null, 2)}</pre>
                        <ApplicationFormsShowcase forms={clubForms} />
                    </>
                )
            }

        </div>
    )
}

export default SubmissionForm