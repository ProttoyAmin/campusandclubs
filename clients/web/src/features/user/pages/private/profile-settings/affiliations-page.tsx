import React from "react";
import { CardContent } from "design/components/ui/card";
import { useSettingsOutlet } from "@/features/user/context/user-layout-context";
import EmptyState from "@/shared/components/empty-state";
import { Button } from "design/components/ui/button";
import { Plus } from "lucide-react";

const UserAffiliationsPage = () => {
  const { me } = useSettingsOutlet();

  if (!me.affiliations || me.affiliations.length === 0) {
    return (
      <EmptyState
        title="No affiliations yet"
        description="Add your affiliations to get started."
        children={
          <Button variant={"ghost"}>
            <Plus /> Claim affiliation
          </Button>
        }
      />
    );
  }

  return (
    <CardContent className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Affiliations</h2>
      <pre>{JSON.stringify(me, null, 2)}</pre>
    </CardContent>
  );
};

export default UserAffiliationsPage;
