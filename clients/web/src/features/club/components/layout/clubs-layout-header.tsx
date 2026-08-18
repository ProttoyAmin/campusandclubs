import type { Club } from "@campus/api";
import { Button } from "design/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

interface Props {
  clubs: Club[];
  onCreateClub: () => void;
}

const ClubsLayoutHeader: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <h1>Clubs</h1>
      <Button
        size="icon"
        variant="outline"
        className="rounded-full"
        onClick={props.onCreateClub}
      >
        <Plus size={18} />
      </Button>
      {props.clubs?.length}
    </div>
  );
};

export default ClubsLayoutHeader;
