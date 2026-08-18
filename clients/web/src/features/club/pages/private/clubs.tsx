import React from "react";
import { useClubsOutlet } from "../../context/club-layout-context";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "design/components/ui/button";
import { paths } from "@/settings/routes";

const Clubs = () => {
  const { clubs } = useClubsOutlet();
  const navigate = useNavigate();
  return (
    <div>
      {clubs?.map((club) => (
        <div key={club.id}>
          <Button onClick={() => navigate(paths.public.club.slug(club?.slug))}>
            {club.name}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Clubs;
