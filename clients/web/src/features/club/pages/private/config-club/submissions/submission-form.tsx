import { useApplication } from '@/features/club/hooks/applications.hooks';
import { useClubOutlet } from '@/features/club/context/club-layout-context';
import EmptyState from '@/shared/components/empty-state';
import { HugeiconsIcon } from '@hugeicons/react';
import { FormIcon } from '@hugeicons/core-free-icons';
import { Button } from 'design/components/ui/button';
import ResponsiveDialog from '@/shared/components/responsive-dialog';
import React from 'react';
import ApplicationFormCreateForm from '@/features/club/forms/club-form-create';


const FormBuilder = () => {
    return (
        <div>
            <h1>Form Builder</h1>
        </div>
    )
}

const SubmissionForm = () => {
    const [isFormBuilderOpen, setIsFormBuilderOpen] = React.useState(false);
    const { club } = useClubOutlet();
    if (!club) return null;
    const { applicationForms, createApplicationForm } = useApplication(club.id);
    const clubForms = applicationForms.data
    const createForm = createApplicationForm()

    if (applicationForms.isLoading) return <div>Loading...</div>;

    return (
        <div>
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
            {clubForms?.data?.length === 0 ?
                <EmptyState title="No Forms" description={clubForms?.message || "No application forms are created yet."} icon={<HugeiconsIcon icon={FormIcon} />}
                    children={
                        <Button variant='outline' className={'rounded-full text-xs px-4'} onClick={() => {
                            setIsFormBuilderOpen(true);
                        }}>
                            Create Application Form
                        </Button>
                    }
                /> : <pre>{JSON.stringify(applicationForms, null, 2)}</pre>
            }

        </div>
    )
}

export default SubmissionForm