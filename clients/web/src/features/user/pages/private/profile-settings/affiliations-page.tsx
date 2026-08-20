import { CardContent } from "design/components/ui/card";
import { useSettingsOutlet } from "@/features/user/context/user-layout-context";
import EmptyState from "@/shared/components/empty-state";
import { Button } from "design/components/ui/button";
import { Plus } from "lucide-react";
import {
  useAffiliation,
  useInstitutes,
} from "@/features/institute/hooks/institute.hooks";
import AffiliationDialog from "@/features/user/components/profile-settings/affiliation-dialog";
import AffiliationCard from "@/features/institute/components/affiliation-card";
import ClaimAffiliationForm from "@/features/institute/forms/claim-affiliation-form";
import { useEmails } from "@/features/user/hooks/user.hooks";
import type { AffiliationClaimInput } from "validation/institute";
import { toast } from "design/components/ui/toast";
import { useState } from "react";

const UserAffiliationsPage = () => {
  const { me } = useSettingsOutlet();
  const { institutes } = useInstitutes("code,name");
  const { data: emails } = useEmails();
  const { claim } = useAffiliation();
  const [open, setOpen] = useState(false);

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
          <AffiliationDialog
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
    <CardContent className="flex flex-col gap-2">
      {/* <pre>{JSON.stringify(me, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(institutes.data, null, 2)}</pre> */}
      {me.affiliations.map((affiliation) => (
        <AffiliationCard
          key={affiliation.id}
          affiliation={affiliation as any}
        />
      ))}
    </CardContent>
  );
};

export default UserAffiliationsPage;
