import React from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "design/components/ui/card";
import { useClubOutlet } from "../../context/club-layout-context";

const ClubPage: React.FC = () => {
  const { club } = useClubOutlet();

  return (
    <div className="">
      <CardHeader>
        <div className="relative">
          {club?.banner && <img src={club?.banner} alt={club?.name} />}
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute top-30 right-6 flex justify-center items-center shadow-md">
            {club?.avatar && (
              <img
                src={club?.avatar}
                alt={club?.name}
                className="w-32 h-32 object-cover rounded-md shadow-2xl"
              />
            )}
          </div>
        </div>
        <CardTitle className="flex justify-between mt-4">
          {club?.name}
        </CardTitle>
        <div className="flex gap-2 items-center">
          <CardDescription>{club?.about}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <pre>{JSON.stringify(club, null, 2)}</pre>
      </CardContent>
    </div>
  );
};

export default ClubPage;
