import { CardContent, CardDescription, CardTitle } from "design/components/ui/card";
import { useSettingsOutlet } from "@/features/user/context/user-layout-context";
import EmptyState from "@/shared/components/empty-state";
import { Button } from "design/components/ui/button";
import { Plus } from "lucide-react";
import {
  useAffiliation,
  useInstitutes,
} from "@/features/institute/hooks/institute.hooks";
import AffiliationCard from "@/features/institute/components/affiliation-card";
import ClaimAffiliationForm from "@/features/institute/forms/claim-affiliation-form";
import { useEmails } from "@/features/user/hooks/user.hooks";
import type { AffiliationClaimInput } from "validation/institute";
import { toast } from "design/components/ui/toast";
import React, { useState } from "react";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import NavigateButtons from "@/shared/components/navigate-buttons";

const UserAffiliationsPage = () => {
  const { me } = useSettingsOutlet();
  const { institutes } = useInstitutes("code,name");
  const { data: emails } = useEmails();
  const { claim } = useAffiliation();
  const [open, setOpen] = useState(false);
  const pageHeader = usePageHeader()

  React.useEffect(() => {
    const id = pageHeader.push(
      <>
        <div className="flex items-center gap-4">
          <NavigateButtons
            hideForward
          />
          <h1 className="text-lg font-semibold">Affiliations</h1>
        </div>
      </>
    );

    return () => {
      pageHeader.pop(id)
    };
  }, [pageHeader.push, pageHeader.pop]);

  const handleSubmit = (data: AffiliationClaimInput) => {
    const email = emails.find((email) => email.email === data.email);
    const values = {
      ...data,
      email: Number(email?.id),
    };

    claim.mutate(values as unknown as AffiliationClaimInput, {
      onSuccess: () => {
        toast.add({
          title: "Affiliation claimed successfully",
          type: "success",
        });
        setOpen(false);
      },
      onError: (error) => {
        console.log(error.response?.data);
      },
    });
  };

  if (!me.affiliations || me.affiliations.length === 0) {
    return (
      <EmptyState
        title="No affiliations yet"
        description="Add your affiliations to get started."
        children={
          <ResponsiveDialog
            open={open}
            onOpenChange={setOpen}
            trigger={
              <Button variant={"ghost"}>
                <Plus /> Claim affiliation
              </Button>
            }
            title="Claim Affialition"
            description="Claiming Affiliation will allow you to join the clubs in your institute."
            children={
              <ClaimAffiliationForm
                institutes={institutes.data?.results || []}
                emails={emails}
                onSubmit={handleSubmit}
                isPending={claim.isPending}
                serverErrors={claim.error?.response.data}
              />
            }
          />
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <ResponsiveDialog
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button variant={"ghost"}>
              <Plus /> Claim affiliation
            </Button>
          }
          title="Claim Affialition"
          description="Claiming Affiliation will allow you to join the clubs in your institute."
          children={
            <ClaimAffiliationForm
              institutes={institutes.data?.results || []}
              emails={emails}
              onSubmit={handleSubmit}
              isPending={claim.isPending}
              serverErrors={claim.error?.response.data}
            />
          }
        />
      </div>

      <div className="pb-6">
        <p className="text-muted-foreground text-sm">Claiming affiliation will allow you to join the clubs in your institute. You can claim multiple affiliations. We verify through your active email that is associated with your affiliated institute or you can choose for a manual review to verify. PS: To add your professional email address, please use the "Add Email" feature first from accounts.</p>
      </div>
      {me.affiliations.map((affiliation) => (
        <AffiliationCard
          key={affiliation.id}
          affiliation={affiliation as any}
        />
      ))}
    </div>
  );
};

export default UserAffiliationsPage;
