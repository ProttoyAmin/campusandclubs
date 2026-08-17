import React from "react";
import { CardContent } from "design/components/ui/card";
import { useSettingsOutlet } from "@/features/user/context/user-layout-context";
import EmptyState from "@/shared/components/empty-state";
import { Button } from "design/components/ui/button";
import { Plus } from "lucide-react";
import { useInstitutes } from "@/features/institute/hooks/institute.hooks";
import AffiliationDialog from "@/features/user/components/profile-settings/affiliation-dialog";

const UserAffiliationsPage = () => {
  const { me } = useSettingsOutlet();
  const { institutes } = useInstitutes("code,name");

  if (!me.affiliations || me.affiliations.length === 0) {
    return (
      <EmptyState
        title="No affiliations yet"
        description="Add your affiliations to get started."
        children={
          <AffiliationDialog
            trigger={
              <Button variant={"ghost"}>
                <Plus /> Claim affiliation
              </Button>
            }
            children={<div>Hello</div>}
          />
        }
      />
    );
  }

  return (
    <CardContent className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Affiliations</h2>
      {/* <pre>{JSON.stringify(me, null, 2)}</pre> */}
      <pre>{JSON.stringify(institutes.data, null, 2)}</pre>
    </CardContent>
  );
};

export default UserAffiliationsPage;
